package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.SkillRepository;
import de.hbt.pwr.profile.model.Skill;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Deletes skill rows that no profile and no project holds any more (#254). <code>Profile.skills</code> has no orphan
 * removal, because the projects of a profile hold the same rows: whoever takes a skill out of a profile and its
 * projects deletes it here, so no row is left for the housekeeping.
 */
@Component
public class SkillRows {

    private final SkillRepository skillRepository;

    public SkillRows(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    public void delete(Collection<Skill> skills) {
        Set<Skill> distinct = Collections.newSetFromMap(new IdentityHashMap<>());
        distinct.addAll(skills);
        List<Skill> rows = distinct.stream().filter(skill -> skill.getId() != null).collect(Collectors.toList());
        skillRepository.deleteAll(rows);
    }
}
