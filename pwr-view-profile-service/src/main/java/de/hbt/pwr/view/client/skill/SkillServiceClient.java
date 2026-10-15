package de.hbt.pwr.view.client.skill;

import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static de.hbt.pwr.view.client.skill.model.SkillServiceCategory.other;

@Service
public class SkillServiceClient {

    @Value("${pwr-skill-service-url}")
    private String pwrSkillServiceUrl;

    private final RestTemplate restTemplate;

    public SkillServiceClient() {
        restTemplate = new RestTemplate();
    }

    public SkillServiceSkill getSkillByName(String qualifier) {
        return restTemplate.exchange(pwrSkillServiceUrl + "/skill/byName?qualifier={qualifier}",
                HttpMethod.GET,
                new HttpEntity<>(null),
                SkillServiceSkill.class,
                Map.of("qualifier", qualifier)
        ).getBody();
    }

    public SkillServiceSkill getDefaultSkillByName(String name) {
        SkillServiceSkill skillServiceSkill = new SkillServiceSkill();
        skillServiceSkill.setCustom(false);
        skillServiceSkill.setQualifier(name);
        skillServiceSkill.setId(-1);
        skillServiceSkill.setCategory(other());
        return skillServiceSkill;
    }
}
