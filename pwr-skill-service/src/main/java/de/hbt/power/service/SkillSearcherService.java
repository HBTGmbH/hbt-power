package de.hbt.power.service;

import de.hbt.power.model.Skill;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.search.DisjunctionMaxQuery;
import org.apache.lucene.search.Query;

import org.hibernate.search.exception.EmptyQueryException;
import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.Search;
import org.hibernate.search.query.dsl.BooleanJunction;
import org.hibernate.search.query.dsl.QueryBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static java.util.Collections.emptyList;

@Service
@Log4j2
public class SkillSearcherService {

    /** Same separators as the tokenizer of {@link Skill#NAME_ANALYZER} */
    private static final Pattern WORD_SEPARATOR = Pattern.compile("[\\s/,;()\\[\\]]+");
    private static final float EXACT_BOOST = 100f;
    private static final float WORD_START_BOOST = 10f;
    private static final int FUZZY_MIN_LENGTH = 4;

    private final EntityManager entityManager;

    @Autowired
    public SkillSearcherService(final EntityManagerFactory entityManagerFactory) {
        entityManager = entityManagerFactory.createEntityManager();
    }

    @Transactional
    @Async
    @SneakyThrows
    public void buildSearchIndex() {
        buildSearchIndexSync();
    }

    void buildSearchIndexSync() throws InterruptedException {
        FullTextEntityManager em = Search.getFullTextEntityManager(entityManager);
        em.createIndexer().startAndWait();
    }

    public List<String> searchSkill(String searchTerm, int maxResults) {
        if (!StringUtils.hasText(searchTerm)) {
            return emptyList();
        }
        try {
            return doSearch(searchTerm, maxResults);
        } catch (EmptyQueryException emptyQueryException) {
            // This happens when the query consists of one of lucenes "stop-words". In this case, we just return an empty list
            return emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> doSearch(String searchTerm, int maxResults) throws EmptyQueryException {
        FullTextEntityManager em = Search.getFullTextEntityManager(entityManager);
        QueryBuilder queryBuilder = em.getSearchFactory().buildQueryBuilder().forEntity(Skill.class).get();
        List<String> words = Arrays.stream(WORD_SEPARATOR.split(searchTerm.trim()))
                .filter(word -> !word.isEmpty())
                .collect(Collectors.toList());

        // Order of the suggestions: exact name > every word as a word start > similar spelling.
        // Each clause scores the better of name and alias, so a match by alias counts like one by name.
        BooleanJunction<?> query = queryBuilder.bool();
        query.should(nameOrAlias(
                queryBuilder.keyword().boostedTo(EXACT_BOOST).onField(Skill.FIELD_EXACT).matching(searchTerm.trim()).createQuery(),
                queryBuilder.keyword().boostedTo(EXACT_BOOST).onField(Skill.FIELD_ALIAS_EXACT).matching(searchTerm.trim()).createQuery()));
        BooleanJunction<?> allWordStarts = queryBuilder.bool();
        for (String word : words) {
            Query wordStart = wordStart(queryBuilder, terms(em, word));
            if (wordStart != null) {
                allWordStarts.must(wordStart);
            }
        }
        if (!allWordStarts.isEmpty()) {
            query.should(queryBuilder.bool().must(allWordStarts.createQuery()).boostedTo(WORD_START_BOOST).createQuery());
        }
        for (String word : words) {
            // per term: the parts of a split word are short (java8 -> 8) and would otherwise match by similarity
            for (String term : terms(em, word)) {
                if (term.length() >= FUZZY_MIN_LENGTH) {
                    query.should(nameOrAlias(similar(queryBuilder, Skill.FIELD_NAME, term),
                            similar(queryBuilder, Skill.FIELD_ALIAS_NAME, term)));
                }
            }
        }
        return (List<String>) em.createFullTextQuery(query.createQuery(), Skill.class)
                .setMaxResults(maxResults)
                .setProjection(Skill.FIELD_NAME)
                .getResultList()
                .stream()
                .map(o -> ((Object[]) o)[0].toString())
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * A word is a word start of a skill if the whole word is (c++, k8s), or if each of its parts with at least two
     * characters is (.NET -> net for ASP.NET Core, spring-bo -> spring and bo). A single letter is not enough: the c of
     * C++ or the k of K8S would bring up every skill starting with it.
     */
    private static Query wordStart(QueryBuilder queryBuilder, List<String> terms) {
        if (terms.isEmpty()) {
            return null;
        }
        // the whole word, kept by preserveOriginal, is the longest term
        String whole = terms.stream().max(Comparator.comparingInt(String::length)).get();
        BooleanJunction<?> either = queryBuilder.bool().should(startsWith(queryBuilder, whole));
        BooleanJunction<?> allParts = queryBuilder.bool();
        terms.stream()
                .filter(term -> !term.equals(whole) && term.length() >= 2)
                .forEach(part -> allParts.must(startsWith(queryBuilder, part)));
        if (!allParts.isEmpty()) {
            either.should(allParts.createQuery());
        }
        return either.createQuery();
    }

    private static Query startsWith(QueryBuilder queryBuilder, String term) {
        return nameOrAlias(
                queryBuilder.keyword().onField(Skill.FIELD_AUTOCOMPLETE).ignoreAnalyzer().matching(term).createQuery(),
                queryBuilder.keyword().onField(Skill.FIELD_ALIAS_AUTOCOMPLETE).ignoreAnalyzer().matching(term).createQuery());
    }

    private static Query similar(QueryBuilder queryBuilder, String field, String term) {
        return queryBuilder.keyword()
                .fuzzy()
                .withEditDistanceUpTo(term.length() <= 5 ? 1 : 2)
                .withPrefixLength(1)
                .onField(field)
                .ignoreAnalyzer()
                .matching(term)
                .createQuery();
    }

    /**
     * The better of the two matches counts, not their sum: a skill whose name and alias both match ranks like one
     * matching only by name
     */
    private static Query nameOrAlias(Query byName, Query byAlias) {
        return new DisjunctionMaxQuery(Arrays.asList(byName, byAlias), 0f);
    }

    /**
     * The terms of the search analyzer for a word: the word itself plus its parts, lower case and without accents
     */
    private static List<String> terms(FullTextEntityManager em, String word) {
        List<String> terms = new ArrayList<>();
        Analyzer analyzer = em.getSearchFactory().getAnalyzer(Skill.QUERY_ANALYZER);
        try (TokenStream stream = analyzer.tokenStream(Skill.FIELD_AUTOCOMPLETE, word)) {
            CharTermAttribute term = stream.addAttribute(CharTermAttribute.class);
            stream.reset();
            while (stream.incrementToken()) {
                terms.add(term.toString());
            }
            stream.end();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return terms;
    }
}
