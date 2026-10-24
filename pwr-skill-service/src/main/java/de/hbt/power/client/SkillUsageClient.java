package de.hbt.power.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Which skills the profiles use, from the profile service (#288): the only data the skill service reads from another
 * service. Never deletes there.
 */
@Service
public class SkillUsageClient {

    @Value("${pwr-profile-service-url}")
    private String pwrProfileServiceUrl;

    private final RestTemplate restTemplate;

    public SkillUsageClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * How many consultants use each skill, by the name of the skill tree, projects included (#271); throws if the
     * profile service doesn't answer, so a failure never looks like skills nobody uses
     */
    @SuppressWarnings("unchecked")
    public Map<String, Integer> findSkillUsage() {
        Map<String, Integer> usage = restTemplate.getForObject(pwrProfileServiceUrl + "/admin/skills/usage", Map.class);
        if (usage == null) {
            throw new RestClientException("the profile service answered nothing");
        }
        return usage;
    }
}
