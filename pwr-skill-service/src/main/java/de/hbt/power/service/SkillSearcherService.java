package de.hbt.power.service;

import de.hbt.power.model.Skill;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;

import org.apache.lucene.search.Query;
import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.Search;
import org.hibernate.search.query.dsl.QueryBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import java.util.List;
import java.util.stream.Collectors;

import static java.util.Collections.emptyList;

@Service
@Log4j2
public class SkillSearcherService {

    private EntityManager entityManager;

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

    @SuppressWarnings("unchecked")
    public List<String> searchSkill(String searchTerm, int maxResults) {
        if (StringUtils.isEmpty(searchTerm)) {
            return emptyList();
        }
        FullTextEntityManager em = Search.getFullTextEntityManager(entityManager);
        QueryBuilder queryBuilder = em.getSearchFactory().buildQueryBuilder().forEntity(Skill.class).get();
        String lowerCaseSearchTerm = searchTerm.toLowerCase();
        Query wildcard = queryBuilder.keyword()
                .wildcard()
                .onFields("qualifier", "qualifiers.qualifier")
                .matching( lowerCaseSearchTerm + "*")
                .createQuery();
        Query fuzzy = queryBuilder.keyword()
                .fuzzy()
                .onFields("qualifier", "qualifiers.qualifier")
                .matching( lowerCaseSearchTerm)
                .createQuery();
        Query query = queryBuilder.bool()
                .should(wildcard)
                .should(fuzzy)
                .createQuery();
        return (List<String>) em.createFullTextQuery(query, Skill.class)
                .setMaxResults(maxResults)
                .setProjection("qualifier")
                .getResultList()
                .stream()
                .map(o -> ((Object[]) o)[0].toString())
                .collect(Collectors.toList());
    }
}
