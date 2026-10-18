package de.hbt.power.service;

import lombok.extern.log4j.Log4j2;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Rebuilds the search index on every start: the index directory outlives the service (/lucene-data, ./target locally),
 * so it has to follow changed analyzers or field definitions, and skills can end up in the database without passing
 * Hibernate Search (sample data via `mvn sql:execute`). With a few thousand skills this takes seconds.
 */
@Component
@Profile("!test")
@Log4j2
public class SearchIndexInitializer {

    private final SkillSearcherService skillSearcherService;

    public SearchIndexInitializer(SkillSearcherService skillSearcherService) {
        this.skillSearcherService = skillSearcherService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void rebuildSearchIndex() {
        log.info("Rebuilding Lucene index on start.");
        skillSearcherService.buildSearchIndex();
    }
}
