package de.hbt.pwr.view.client.skill;

import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Component
@FeignClient(value = "pwr-skill-service")
public interface SkillServiceClient {
    @GetMapping("/skill/byName")
    SkillServiceSkill getSkillByName(@RequestParam("qualifier") String qualifier);
}
