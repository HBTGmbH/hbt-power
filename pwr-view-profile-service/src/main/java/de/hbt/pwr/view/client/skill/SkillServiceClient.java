package de.hbt.pwr.view.client.skill;

import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

import static de.hbt.pwr.view.client.skill.model.SkillServiceCategory.other;

@Service
public class SkillServiceClient {

    @Value("${pwr-skill-service-url}")
    private String pwrSkillServiceUrl;

    private final RestTemplate restTemplate;

    public SkillServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * The skill of the tree with this name or alias, null if there is none. The name is encoded completely (#330): a
     * template in the URL leaves '+' as it is, and the skill service reads it as a space, so C++ wasn't found.
     */
    public SkillServiceSkill getSkillByName(String qualifier) {
        URI uri = UriComponentsBuilder.fromHttpUrl(pwrSkillServiceUrl + "/skill/byName")
                .queryParam("qualifier", "{qualifier}")
                .encode()
                .buildAndExpand(qualifier)
                .toUri();
        return restTemplate.getForObject(uri, SkillServiceSkill.class);
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
