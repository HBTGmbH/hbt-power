package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.client.SkillProfileClient;
import de.hbt.pwr.profile.client.StatisticsClient;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.Profile;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.*;
import java.util.stream.Collectors;

import static org.apache.logging.log4j.LogManager.getLogger;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    private final SkillProfileClient skillProfileClient;

    private final StatisticsClient statisticsClient;

    private static Logger LOG = getLogger(ProfileService.class);


    @Autowired
    public ProfileService(ProfileRepository profileRepository, SkillProfileClient skillProfileClient,
                          StatisticsClient statisticsClient) {
        this.profileRepository = profileRepository;
        this.skillProfileClient = skillProfileClient;
        this.statisticsClient = statisticsClient;
    }

    /**
     * Merges the skill <code>source</code> into the skill <code>target</code>, in the skill tree (the source becomes an
     * alias of the target) and in all profiles and projects. Where a profile has both, the target keeps the higher
     * rating and the versions of both. The optional <code>version</code> is added wherever the source was. Calling it
     * again with the same arguments changes nothing.
     */
    @Transactional
    public List<Profile> mergeSkills(String source, String target, String version) {
        String sourceName = source.trim();
        String targetName = target.trim();
        String addedVersion = version == null || version.trim().isEmpty() ? null : version.trim();
        LOG.info("Merging skill " + sourceName + " into " + targetName + (addedVersion == null ? "" : " with version " + addedVersion));
        // The skill service checks the merge (target exists, no conflicting alias) before any profile changes
        skillProfileClient.mergeSkills(sourceName, targetName);
        return mergeSkillsInProfiles(sourceName, targetName, addedVersion);
    }

    /**
     * Like {@link #mergeSkills(String, String, String)}, but only in the profiles and projects, without the skill tree.
     */
    @Transactional
    public List<Profile> mergeSkillsInProfiles(String source, String target, String version) {
        List<Profile> profiles = profileRepository.findAll()
                .stream()
                .peek(profile -> new SkillMerger(source, target, version).mergeIn(profile))
                .collect(Collectors.toList());
        refreshStatisticsAfterCommit();
        return profiles;
    }

    /**
     * The statistics keep a copy of the profiles, which shows the admin who uses a skill (#205). They read the profiles
     * from this service, so only once the merge is committed.
     */
    private void refreshStatisticsAfterCommit() {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            statisticsClient.refreshConsultants();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
            @Override
            public void afterCommit() {
                statisticsClient.refreshConsultants();
            }
        });
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

        void mergeIn(Profile profile) {
            profile.setSkills(merge(profile.getSkills()));
            profile.getProjects().forEach(project -> project.setSkills(merge(project.getSkills().stream()
                    .map(skill -> replacements.getOrDefault(skill, skill))
                    .collect(Collectors.toList()))));
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
