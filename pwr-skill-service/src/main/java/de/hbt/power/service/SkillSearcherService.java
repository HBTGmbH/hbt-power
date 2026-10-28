package de.hbt.power.service;

import de.hbt.power.model.Skill;
import de.hbt.power.model.dto.SkillSuggestion;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.document.Document;
import org.apache.lucene.search.BoostQuery;
import org.apache.lucene.search.DisjunctionMaxQuery;
import org.apache.lucene.search.Query;

import org.hibernate.search.exception.EmptyQueryException;
import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.Search;
import org.hibernate.search.engine.ProjectionConstants;
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
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
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
    /** A match by alias counts a bit less than the same match by name: J brings Java before JavaScript (alias JS) */
    private static final float ALIAS_BOOST = 0.5f;

    private final EntityManagerFactory entityManagerFactory;

    @Autowired
    public SkillSearcherService(final EntityManagerFactory entityManagerFactory) {
        this.entityManagerFactory = entityManagerFactory;
    }

    /** An EntityManager of its own per call: it is not thread-safe, and requests search at the same time (#352) */
    private <T> T withSearch(Function<FullTextEntityManager, T> work) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            return work.apply(Search.getFullTextEntityManager(entityManager));
        } finally {
            entityManager.close();
        }
    }

    @Transactional
    @Async
    @SneakyThrows
    public void buildSearchIndex() {
        buildSearchIndexSync();
    }

    void buildSearchIndexSync() throws InterruptedException {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            Search.getFullTextEntityManager(entityManager).createIndexer().startAndWait();
        } finally {
            entityManager.close();
        }
    }

    public List<String> searchSkill(String searchTerm, int maxResults) {
        return withSearch(em -> search(em, searchTerm, maxResults).stream().map(hit -> hit.name).collect(Collectors.toList()));
    }

    /**
     * Like {@link #searchSkill(String, int)}, with the alias that matched the search term better than the name
     */
    public List<SkillSuggestion> suggestSkills(String searchTerm, int maxResults) {
        return withSearch(em -> {
            List<Hit> hits = search(em, searchTerm, maxResults);
            if (hits.isEmpty()) {
                return emptyList();
            }
            MatchLevel level = new MatchLevel(em, searchTerm);
            return hits.stream()
                    .map(hit -> new SkillSuggestion(hit.name, matchingAlias(level, hit)))
                    .collect(Collectors.toList());
        });
    }

    private static String matchingAlias(MatchLevel level, Hit hit) {
        if (hit.aliases.isEmpty()) {
            return null;
        }
        double byName = level.of(hit.name);
        return hit.aliases.stream()
                .filter(alias -> level.of(alias) > byName)
                .max(Comparator.comparingDouble(level::of).thenComparing(Comparator.comparingInt(String::length).reversed()))
                .map(String::trim)
                .orElse(null);
    }

    private static class Hit {
        private final String name;
        /** From the index, which stores them for this: the search reads no database (#352) */
        private final List<String> aliases;

        private Hit(String name, List<String> aliases) {
            this.name = name;
            this.aliases = aliases;
        }
    }

    private List<Hit> search(FullTextEntityManager em, String searchTerm, int maxResults) {
        if (!StringUtils.hasText(searchTerm)) {
            return emptyList();
        }
        try {
            return doSearch(em, searchTerm, maxResults);
        } catch (EmptyQueryException emptyQueryException) {
            // This happens when the query consists of one of lucenes "stop-words". In this case, we just return an empty list
            return emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Hit> doSearch(FullTextEntityManager em, String searchTerm, int maxResults) throws EmptyQueryException {
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
        Set<String> names = new HashSet<>();
        return ((List<Object[]>) em.createFullTextQuery(query.createQuery(), Skill.class)
                .setMaxResults(maxResults)
                .setProjection(Skill.FIELD_NAME, ProjectionConstants.DOCUMENT)
                .getResultList())
                .stream()
                // all aliases only through the document: a projection of a field with several values returns one
                .map(row -> new Hit(row[0].toString(), Arrays.asList(((Document) row[1]).getValues(Skill.FIELD_ALIAS_NAME))))
                .filter(hit -> names.add(hit.name))
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
     * matching only by name. A match by alias is weighted a bit lower, so that a name wins over an alias of similar
     * length; an exact alias still comes first.
     */
    private static Query nameOrAlias(Query byName, Query byAlias) {
        return new DisjunctionMaxQuery(Arrays.asList(byName, new BoostQuery(byAlias, ALIAS_BOOST)), 0f);
    }

    /**
     * The terms of the search analyzer for a word: the word itself plus its parts, lower case and without accents
     */
    private static List<String> terms(FullTextEntityManager em, String word) {
        return analyze(em, Skill.QUERY_ANALYZER, word);
    }

    private static List<String> analyze(FullTextEntityManager em, String analyzerName, String text) {
        List<String> terms = new ArrayList<>();
        Analyzer analyzer = em.getSearchFactory().getAnalyzer(analyzerName);
        try (TokenStream stream = analyzer.tokenStream("", text)) {
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

    /**
     * How well a text (a name or an alias) matches the search term, by the rules of the search: exact (3) before every
     * word as a word start (2) before a similar spelling (below 1, the closer the higher), 0 if none applies.
     */
    private static class MatchLevel {
        private final FullTextEntityManager em;
        private final String exact;
        private final List<List<String>> words;

        MatchLevel(FullTextEntityManager em, String searchTerm) {
            this.em = em;
            this.exact = String.join("", analyze(em, Skill.EXACT_ANALYZER, searchTerm.trim()));
            this.words = Arrays.stream(WORD_SEPARATOR.split(searchTerm.trim()))
                    .filter(word -> !word.isEmpty())
                    .map(word -> terms(em, word))
                    .filter(terms -> !terms.isEmpty())
                    .collect(Collectors.toList());
        }

        double of(String text) {
            if (exact.equals(String.join("", analyze(em, Skill.EXACT_ANALYZER, text)))) {
                return 3;
            }
            Set<String> wordStarts = new HashSet<>(analyze(em, Skill.AUTOCOMPLETE_ANALYZER, text));
            if (!words.isEmpty() && words.stream().allMatch(terms -> isWordStart(terms, wordStarts))) {
                return 2;
            }
            return similarity(analyze(em, Skill.NAME_ANALYZER, text));
        }

        /** Same rule as {@link #wordStart}: the whole word, or each of its parts with at least two characters */
        private static boolean isWordStart(List<String> terms, Collection<String> wordStarts) {
            String whole = terms.stream().max(Comparator.comparingInt(String::length)).get();
            if (wordStarts.contains(whole)) {
                return true;
            }
            List<String> parts = terms.stream().filter(t -> !t.equals(whole) && t.length() >= 2).collect(Collectors.toList());
            return !parts.isEmpty() && wordStarts.containsAll(parts);
        }

        /** Same rule as {@link #similar}: first letter equal, edit distance up to 1 (up to 5 letters) or 2 */
        private double similarity(List<String> textTerms) {
            double best = 0;
            for (List<String> terms : words) {
                for (String term : terms) {
                    if (term.length() < FUZZY_MIN_LENGTH) {
                        continue;
                    }
                    int allowed = term.length() <= 5 ? 1 : 2;
                    for (String candidate : textTerms) {
                        if (!candidate.isEmpty() && candidate.charAt(0) == term.charAt(0)) {
                            int distance = editDistance(term, candidate);
                            if (distance <= allowed) {
                                best = Math.max(best, 1 - 0.1 * (distance + 1));
                            }
                        }
                    }
                }
            }
            return best;
        }

        /** Damerau-Levenshtein distance (optimal string alignment), as Lucene's fuzzy query counts transpositions as one */
        private static int editDistance(String a, String b) {
            int[][] d = new int[a.length() + 1][b.length() + 1];
            for (int i = 0; i <= a.length(); i++) {
                d[i][0] = i;
            }
            for (int j = 0; j <= b.length(); j++) {
                d[0][j] = j;
            }
            for (int i = 1; i <= a.length(); i++) {
                for (int j = 1; j <= b.length(); j++) {
                    int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                    d[i][j] = Math.min(Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1), d[i - 1][j - 1] + cost);
                    if (i > 1 && j > 1 && a.charAt(i - 1) == b.charAt(j - 2) && a.charAt(i - 2) == b.charAt(j - 1)) {
                        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
                    }
                }
            }
            return d[a.length()][b.length()];
        }
    }
}
