package de.hbt.power.service;

import lombok.extern.log4j.Log4j2;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Locally, skills can end up in the database without passing Hibernate Search (sample data via `mvn sql:execute`),
 * and the index in ./target is lost on `mvn clean`. Rebuild the search index on every localDev start.
 */
@Component
@Profile("localDev")
@Log4j2
public class LocalDevSearchIndexInitializer {

    private final SkillSearcherService skillSearcherService;

    public LocalDevSearchIndexInitializer(SkillSearcherService skillSearcherService) {
        this.skillSearcherService = skillSearcherService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void rebuildSearchIndex() {
        log.info("localDev profile active: rebuilding Lucene index.");
        skillSearcherService.buildSearchIndex();
    }
}
