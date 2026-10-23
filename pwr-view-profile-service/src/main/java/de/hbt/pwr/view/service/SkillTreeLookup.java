package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Finds names in the skill tree, each name once (#208): a skill name in any case or an alias stands for the skill of
 * the tree. One lookup lives as long as one view profile is created or updated.
 */
class SkillTreeLookup {

    private final SkillServiceClient skillServiceClient;
    private final Map<String, Optional<SkillServiceSkill>> skills = new HashMap<>();

    SkillTreeLookup(SkillServiceClient skillServiceClient) {
        this.skillServiceClient = skillServiceClient;
    }

    Optional<SkillServiceSkill> skill(String name) {
        return skills.computeIfAbsent(name.trim(), trimmed -> Optional.ofNullable(skillServiceClient.getSkillByName(trimmed)));
    }

    /**
     * The name of the skill in the tree, or the name itself if the tree doesn't know it
     */
    String treeName(String name) {
        return skill(name).map(SkillServiceSkill::getQualifier).orElse(name.trim());
    }
}
