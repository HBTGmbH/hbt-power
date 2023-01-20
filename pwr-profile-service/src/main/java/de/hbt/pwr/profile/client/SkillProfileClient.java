package de.hbt.pwr.profile.client;

import de.hbt.pwr.profile.model.skill.SkillCategory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
}
