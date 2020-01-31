package de.hbt.pwr.view.client.skill;

import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Component;

import static de.hbt.pwr.view.client.skill.model.SkillServiceCategory.other;

@Component(value = "skillServiceFallback")
public class SkillServiceFallback
        implements SkillServiceClient {

    private static final Logger LOG = LogManager.getLogger(SkillServiceFallback.class);

    @Override
    public SkillServiceSkill getSkillByName(String qualifier) {
        LOG.warn("SkillServiceFallback#getSkillByName fallback triggered for qualifier="
                + qualifier);
        SkillServiceSkill skillServiceSkill = new SkillServiceSkill();
        skillServiceSkill.setCustom(false);
        skillServiceSkill.setQualifier(qualifier);
        skillServiceSkill.setId(-1);
        skillServiceSkill.setCategory(other());
        return skillServiceSkill;
    }

    @Override
    public SkillServiceCategory getCategoryByQualifier(String qualifier) {
        SkillServiceCategory skillServiceCategory = new SkillServiceCategory();
        skillServiceCategory.setBlacklisted(true);
        skillServiceCategory.setCustom(true);
        skillServiceCategory.setQualifier(qualifier);
        skillServiceCategory.setId(-1);

        return skillServiceCategory;
    }
}
