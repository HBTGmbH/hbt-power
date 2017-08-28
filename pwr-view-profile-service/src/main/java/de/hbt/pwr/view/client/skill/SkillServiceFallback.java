package de.hbt.pwr.view.client.skill;

import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

@Component
public class SkillServiceFallback implements SkillServiceClient{

    private static final Logger LOG = Logger.getLogger(SkillServiceFallback.class);

    @Override
    public SkillServiceSkill getSkillByName(String qualifier) {
        LOG.warn("SkillServiceFallback#getSkillByName fallback triggered for qualifier=" + qualifier);
        SkillServiceSkill skillServiceSkill = new SkillServiceSkill();
        skillServiceSkill.setCustom(false);
        skillServiceSkill.setQualifier(qualifier);
        skillServiceSkill.setId(-1);

        SkillServiceCategory skillServiceCategory = new SkillServiceCategory();
        skillServiceCategory.setBlacklisted(true);
        skillServiceCategory.setCustom(true);
        skillServiceCategory.setQualifier("Other");

        skillServiceSkill.setCategory(skillServiceCategory);
        return skillServiceSkill;
    }
}
