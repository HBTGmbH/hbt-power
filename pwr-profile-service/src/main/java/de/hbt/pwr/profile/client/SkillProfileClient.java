package de.hbt.pwr.profile.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.skill.SkillCategory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;

@Service
public class SkillProfileClient {
    @Value("${pwr-skill-service-url}")
    private String pwrSkillServiceUrl;
    private final RestTemplate restTemplate;

    public SkillProfileClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public SkillCategory updateAndGetCategory(String qualifier) {
        String url = pwrSkillServiceUrl + "/skill?qualifier=" + qualifier;
        return restTemplate.postForEntity(url, null, SkillCategory.class).getBody();
    }

    /**
     * Merges skill <code>source</code> into skill <code>target</code> in the skill tree. Errors of the skill service
     * (unknown target, conflicting alias) keep their status.
     */
    public void mergeSkills(String source, String target) {
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(pwrSkillServiceUrl + "/admin/skill/merge")
                    .queryParam("source", "{source}")
                    .queryParam("target", "{target}")
                    // encodes the values completely, '+' included, which would otherwise arrive as a space
                    .encode()
                    .buildAndExpand(source, target)
                    .toUri();
            restTemplate.postForEntity(uri, null, Void.class);
        } catch (HttpStatusCodeException e) {
            throw new WebApplicationException(e.getStatusCode(), messageOf(e));
        }
    }

    /**
     * The message of a skill service error ({"errorType": ..., "message": ...}), else the whole body.
     */
    private static String messageOf(HttpStatusCodeException e) {
        try {
            JsonNode message = new ObjectMapper().readTree(e.getResponseBodyAsString()).get("message");
            if (message != null && message.isTextual()) {
                return message.asText();
            }
        } catch (IOException ignored) {
            // no JSON
        }
        return e.getResponseBodyAsString();
    }
}
