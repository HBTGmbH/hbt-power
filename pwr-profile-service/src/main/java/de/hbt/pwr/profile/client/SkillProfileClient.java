package de.hbt.pwr.profile.client;

import de.hbt.pwr.profile.model.skill.SkillCategory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@Component
@FeignClient(value = "pwr-skill-service", fallback = SkillProfileClientFallback.class)
public interface SkillProfileClient {
    @RequestMapping(method = RequestMethod.POST, path = "/skill", consumes = "application/json", produces = "application/json")
    ResponseEntity<SkillCategory> updateAndGetCategory(@RequestParam("qualifier") String qualifier);
}