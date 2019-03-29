package de.hbt.pwr.profile.client;

import de.hbt.pwr.profile.model.skill.SkillCategory;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import static org.apache.logging.log4j.LogManager.getLogger;

@Component
public class SkillProfileClientFallback implements SkillProfileClient {
    private static final Logger LOG = getLogger(SkillProfileClient.class);

    @Override
    public ResponseEntity<SkillCategory> updateAndGetCategory(String qualifier) {
        LOG.warn("Skill Profile Fallback triggered for skill with qualifier '" + qualifier + "'. Falling back to default category.");
        SkillCategory res = new SkillCategory();
        res.setQualifier("Other");
        return ResponseEntity.ok(res);
    }
}