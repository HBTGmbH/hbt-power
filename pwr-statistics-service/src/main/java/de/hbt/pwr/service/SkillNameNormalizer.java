package de.hbt.pwr.service;

import de.hbt.pwr.client.SkillTreeClient;
import de.hbt.pwr.model.profile.Consultant;
import de.hbt.pwr.model.profile.Profile;
import de.hbt.pwr.model.profile.Skill;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Brings the skills of the consultants to the names of the skill tree before anything is counted (#208), so
 * <code>.Net</code>, <code>.NET</code> and the alias <code>.NET Core</code> count as <code>.NET</code>. Skills that
 * end up with the same name in one profile or project become one, with the higher rating.
 */
@Service
public class SkillNameNormalizer {

    private static final Logger LOG = LoggerFactory.getLogger(SkillNameNormalizer.class);

    private final SkillTreeClient skillTreeClient;

    private volatile SkillNames skillNames = SkillNames.none();

    public SkillNameNormalizer(SkillTreeClient skillTreeClient) {
        this.skillTreeClient = skillTreeClient;
    }

    /**
     * Reads the skill tree again. Without an answer the last known names stay, at the start none.
     */
    public void refresh() {
        skillTreeClient.getSkillNames().ifPresentOrElse(
                names -> skillNames = names,
                () -> LOG.warn("Skill names stay as before" + (skillNames.isEmpty() ? ", not normalized" : "")));
    }

    public String treeName(String name) {
        return skillNames.treeName(name);
    }

    public List<String> treeNames(Collection<String> names) {
        return names.stream().map(this::treeName).distinct().collect(Collectors.toList());
    }

    public void normalize(Consultant consultant) {
        Profile profile = consultant.getProfile();
        if (profile == null) {
            return;
        }
        profile.setSkills(normalize(profile.getSkills()));
        if (profile.getProjects() != null) {
            profile.getProjects().forEach(project -> project.setSkills(normalize(project.getSkills())));
        }
    }

    private Set<Skill> normalize(Set<Skill> skills) {
        if (skills == null) {
            return new HashSet<>();
        }
        Map<String, Skill> byName = new LinkedHashMap<>();
        for (Skill skill : skills) {
            skill.setName(treeName(skill.getName()));
            byName.merge(skill.getName(), skill, SkillNameNormalizer::higherRated);
        }
        return new HashSet<>(byName.values());
    }

    private static Skill higherRated(Skill one, Skill other) {
        int oneRating = one.getRating() == null ? 0 : one.getRating();
        int otherRating = other.getRating() == null ? 0 : other.getRating();
        return otherRating > oneRating ? other : one;
    }
}
