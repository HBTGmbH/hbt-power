package de.hbt.power.service;

import de.hbt.power.model.Skill;
import lombok.extern.log4j.Log4j2;
import org.apache.lucene.search.Query;
import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.Search;
import org.hibernate.search.query.dsl.QueryBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import java.util.List;
import java.util.stream.Collectors;

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
    public void buildSearchIndex() {
        FullTextEntityManager em = Search.getFullTextEntityManager(entityManager);
        em.createIndexer().threadsToLoadObjects(5).idFetchSize(1000).start();
    }

    @SuppressWarnings("unchecked")
    public List<String> searchSkill(String searchTerm, int maxResults) {
        FullTextEntityManager em = Search.getFullTextEntityManager(entityManager);
        QueryBuilder queryBuilder = em.getSearchFactory().buildQueryBuilder().forEntity(Skill.class).get();
        Query query = queryBuilder.keyword()
                .fuzzy()
                .withPrefixLength(2)
                .onFields("qualifier", "qualifiers.qualifier")
                .matching("*" + searchTerm + "*")
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
