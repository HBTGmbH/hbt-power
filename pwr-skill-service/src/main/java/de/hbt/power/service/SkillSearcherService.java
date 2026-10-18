package de.hbt.power.service;

import de.hbt.power.model.Skill;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;

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

import java.util.Arrays;
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
        QueryBuilder queryBuilder = em.getSearchFactory().buildQueryBuilder().forEntity(Skill.class)
                // the type-ahead field holds word starts; the input is split like a name, but not at case changes
                .overridesForField(Skill.FIELD_AUTOCOMPLETE, Skill.QUERY_ANALYZER)
                .overridesForField(Skill.FIELD_NAME, Skill.QUERY_ANALYZER)
                .get();
        List<String> words = Arrays.stream(WORD_SEPARATOR.split(searchTerm.trim()))
                .filter(word -> !word.isEmpty())
                .collect(Collectors.toList());

        // Order of the suggestions: exact name > every word as a word start > similar spelling
        BooleanJunction<?> query = queryBuilder.bool();
        query.should(queryBuilder.keyword()
                .boostedTo(EXACT_BOOST)
                .onField(Skill.FIELD_EXACT)
                .matching(searchTerm.trim())
                .createQuery());
        BooleanJunction<?> allWordStarts = queryBuilder.bool();
        for (String word : words) {
            allWordStarts.must(queryBuilder.keyword().onField(Skill.FIELD_AUTOCOMPLETE).matching(word).createQuery());
        }
        if (!allWordStarts.isEmpty()) {
            query.should(queryBuilder.bool().must(allWordStarts.createQuery()).boostedTo(WORD_START_BOOST).createQuery());
        }
        for (String word : words) {
            if (word.length() >= FUZZY_MIN_LENGTH) {
                query.should(queryBuilder.keyword()
                        .fuzzy()
                        .withEditDistanceUpTo(word.length() <= 5 ? 1 : 2)
                        .withPrefixLength(1)
                        .onField(Skill.FIELD_NAME)
                        .matching(word)
                        .createQuery());
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
}
