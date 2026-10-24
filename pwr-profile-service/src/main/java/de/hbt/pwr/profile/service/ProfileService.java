package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.client.SkillProfileClient;
import de.hbt.pwr.profile.client.StatisticsClient;
import com.fasterxml.jackson.databind.JsonNode;
import de.hbt.pwr.profile.data.AdminNotificationRepository;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.Profile;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import static org.apache.logging.log4j.LogManager.getLogger;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    private final SkillProfileClient skillProfileClient;

    private final StatisticsClient statisticsClient;

    private final AdminNotificationRepository adminNotificationRepository;

    private final SkillRows skillRows;

    private static Logger LOG = getLogger(ProfileService.class);


    @Autowired
    public ProfileService(ProfileRepository profileRepository, SkillProfileClient skillProfileClient,
                          StatisticsClient statisticsClient, AdminNotificationRepository adminNotificationRepository,
                          SkillRows skillRows) {
        this.profileRepository = profileRepository;
        this.skillRows = skillRows;
        this.adminNotificationRepository = adminNotificationRepository;
        this.skillProfileClient = skillProfileClient;
        this.statisticsClient = statisticsClient;
    }

    /**
     * Merges the skill <code>source</code> into the skill <code>target</code>, in the skill tree (the source becomes an
     * alias of the target) and in all profiles and projects. Where a profile has both, the target keeps the higher
     * rating and the versions of both. The optional <code>version</code> is added wherever the source was. Calling it
     * again with the same arguments changes nothing.
     * <p>
     * The profiles get the name of the target in the skill tree, so <code>.Net</code> can be merged into
     * <code>.NET</code> and the other way round (#207).
     */
    @Transactional
    public List<Profile> mergeSkills(String source, String target, String version) {
        String sourceName = source.trim();
        String targetName = target.trim();
        String addedVersion = version == null || version.trim().isEmpty() ? null : version.trim();
        LOG.info("Merging skill " + sourceName + " into " + targetName + (addedVersion == null ? "" : " with version " + addedVersion));
        // The skill service checks the merge (target exists, no conflicting alias) before any profile changes
        String treeName = skillProfileClient.mergeSkills(sourceName, targetName);
        return mergeSkillsInProfiles(sourceName, treeName == null ? targetName : treeName, addedVersion);
    }

    /**
     * Like {@link #mergeSkills(String, String, String)}, but only in the profiles and projects, without the skill tree.
     */
    @Transactional
    public List<Profile> mergeSkillsInProfiles(String source, String target, String version) {
        List<Profile> profiles = profileRepository.findAll();
        List<Skill> mergedAway = new ArrayList<>();
        profiles.forEach(profile -> mergedAway.addAll(new SkillMerger(source, target, version).mergeIn(profile)));
        // The skills merged into another one of the same profile: nothing holds them any more (#254)
        skillRows.delete(mergedAway);
        // The statistics keep a copy of the profiles, which shows the admin who uses a skill (#205)
        statisticsClient.refreshConsultantsAfterCommit();
        return profiles;
    }

    /**
     * Renames the skill <code>name</code> of the skill tree to <code>newName</code> (#228), in the tree, where the old
     * name becomes an alias, and in all profiles and projects, in every case of the old name. Aliases typed in a
     * profile stay as they are (#208). A profile that has the new name as well keeps one skill, like a merge.
     */
    @Transactional
    public List<Profile> renameSkill(String name, String newName) {
        if (name == null || name.isBlank() || newName == null || newName.isBlank()) {
            throw new WebApplicationException(HttpStatus.BAD_REQUEST, "A skill needs a name");
        }
        String oldName = name.trim();
        LOG.info("Renaming skill " + oldName + " to " + newName.trim());
        // The skill service checks the rename (skill exists, new name free) before any profile changes
        String treeName = skillProfileClient.renameSkill(oldName, newName.trim());
        return mergeSkillsInProfiles(oldName, treeName, null);
    }

    /**
     * Deletes the skill <code>name</code> from all profiles and projects, under its name and its aliases in any case,
     * and then from the skill tree (#229). The admin notifications about it go with it. If the skill tree refuses,
     * the profiles stay as they were.
     */
    @Transactional
    public List<Profile> deleteSkill(String name) {
        if (name == null || name.isBlank()) {
            throw new WebApplicationException(HttpStatus.BAD_REQUEST, "A skill needs a name");
        }
        JsonNode treeSkill = skillProfileClient.requireTreeSkill(name.trim());
        Set<String> names = new HashSet<>();
        names.add(treeSkill.path("qualifier").asText().toLowerCase());
        treeSkill.path("aliases").forEach(alias -> names.add(alias.asText().toLowerCase()));
        LOG.info("Deleting skill " + names + " from all profiles and the skill tree");
        Predicate<Skill> isDeleted = skill -> skill.getName() != null && names.contains(skill.getName().toLowerCase());
        List<Profile> profiles = profileRepository.findAll();
        List<Skill> removed = new ArrayList<>();
        profiles.forEach(profile -> {
            profile.getProjects().forEach(project -> {
                project.getSkills().stream().filter(isDeleted).forEach(removed::add);
                project.getSkills().removeIf(isDeleted);
            });
            profile.getSkills().stream().filter(isDeleted).forEach(removed::add);
            profile.getSkills().removeIf(isDeleted);
        });
        names.forEach(skillName -> adminNotificationRepository.deleteAll(
                adminNotificationRepository.findSkillNotificationsBySkillName(skillName)));
        // Their rows go too, nothing holds them any more (#254)
        skillRows.delete(removed);
        skillProfileClient.deleteSkill(treeSkill.path("id").asLong());
        statisticsClient.refreshConsultantsAfterCommit();
        return profiles;
    }

    /**
     * Merges within one profile. Project skills are the same objects as the profile skills, so the profile goes
     * first, and the projects then get the kept skill instead of the merged one.
     */
    private static class SkillMerger {
        private final String sourceName;
        private final String targetName;
        private final String version;
        private final Map<Skill, Skill> replacements = new IdentityHashMap<>();

        SkillMerger(String sourceName, String targetName, String version) {
            this.sourceName = sourceName;
            this.targetName = targetName;
            this.version = version;
        }

        /**
         * @return the skills merged into another one, which neither the profile nor its projects hold any more
         */
        Collection<Skill> mergeIn(Profile profile) {
            profile.setSkills(merge(profile.getSkills()));
            profile.getProjects().forEach(project -> project.setSkills(merge(project.getSkills().stream()
                    .map(skill -> replacements.getOrDefault(skill, skill))
                    .collect(Collectors.toList()))));
            return replacements.keySet();
        }

        /**
         * Names and ratings change, which the hash codes depend on, so the result is a new set.
         */
        private Set<Skill> merge(Collection<Skill> skills) {
            Skill kept = skills.stream().filter(skill -> targetName.equals(skill.getName())).findAny().orElse(null);
            Set<Skill> result = Collections.newSetFromMap(new IdentityHashMap<>());
            boolean merged = false;
            for (Skill skill : skills) {
                if (!isSource(skill)) {
                    result.add(skill);
                } else if (kept == null) {
                    skill.setName(targetName);
                    kept = skill;
                    result.add(skill);
                    merged = true;
                } else {
                    if (kept.getRating() == null || (skill.getRating() != null && skill.getRating() > kept.getRating())) {
                        kept.setRating(skill.getRating());
                    }
                    versionsOf(kept).addAll(versionsOf(skill));
                    replacements.put(skill, kept);
                    merged = true;
                }
            }
            if (merged && version != null) {
                versionsOf(kept).add(version);
            }
            return new HashSet<>(result);
        }

        private boolean isSource(Skill skill) {
            return skill.getName() != null && skill.getName().equalsIgnoreCase(sourceName) && !skill.getName().equals(targetName);
        }

        private static Set<String> versionsOf(Skill skill) {
            if (skill.getVersions() == null) {
                skill.setVersions(new HashSet<>());
            }
            return skill.getVersions();
        }
    }
}
