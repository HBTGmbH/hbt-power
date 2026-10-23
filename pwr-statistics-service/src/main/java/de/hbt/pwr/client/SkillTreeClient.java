package de.hbt.pwr.client;

import com.fasterxml.jackson.databind.JsonNode;
import de.hbt.pwr.service.SkillNames;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

/**
 * Reads the skill tree of the skill service, whose names the statistics count under (#208)
 */
@Component
public class SkillTreeClient {

    private static final Logger LOG = LoggerFactory.getLogger(SkillTreeClient.class);

    private final RestTemplate restTemplate;

    @Value("${pwr-skill-service-url}")
    private String pwrSkillServiceUrl;

    public SkillTreeClient() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Empty if the skill service doesn't answer
     */
    public Optional<SkillNames> getSkillNames() {
        try {
            JsonNode root = restTemplate.getForObject(pwrSkillServiceUrl + "/skill/tree", JsonNode.class);
            return Optional.ofNullable(root).map(SkillNames::fromTree);
        } catch (RuntimeException e) {
            LOG.warn("Skill tree not available: " + e.getMessage());
            return Optional.empty();
        }
    }
}
