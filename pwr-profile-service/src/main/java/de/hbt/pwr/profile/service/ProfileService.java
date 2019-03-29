package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.Project;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.apache.logging.log4j.LogManager.getLogger;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    private static Logger LOG = getLogger(ProfileService.class);


    @Autowired
    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Transactional
    public List<Profile> renameAndMergeSkills(String oldName, String newName) {
        LOG.info("Renaming skill from " + oldName + " to " + newName);
        return profileRepository.findAll()
                .stream()
                .peek(profile -> renameSkillsInProfile(profile, oldName, newName))
                .collect(Collectors.toList());
    }

    private void renameSkillsInProfile(Profile profile, String oldName, String newName) {
        SkillReNamer skillReNamer = new SkillReNamer(oldName, newName, profile.getSkills());
        profile.setSkills(skillReNamer.execute());

        Set<Project> newProjects = profile.getProjects().stream()
                .peek(project -> renameSkillsInProject(project, oldName, newName))
                .collect(Collectors.toSet());
        profile.setProjects(newProjects);
    }

    private void renameSkillsInProject(Project project, String oldName, String newName) {
        SkillReNamer skillReNamer = new SkillReNamer(oldName, newName, project.getSkills());
        project.setSkills(skillReNamer.execute());
    }

    private class SkillReNamer {
        private final String oldName;
        private final String newName;
        private final Set<Skill> skills;
        private final Map<String, Skill> seenSkills;

        public SkillReNamer(String oldName, String newName, Set<Skill> skills) {
            this.oldName = oldName;
            this.newName = newName;
            this.skills = skills;
            seenSkills = new HashMap<>();
        }

        public Set<Skill> execute() {
            return skills.stream()
                    .peek(this::renameSkill)
                    .filter(this::removeWhileAdaptingLevel)
                    .collect(Collectors.toSet());
        }

        private void renameSkill(Skill skill) {
            if (skill.getName().equals(oldName)) {
                skill.setName(newName);
            }
        }

        private boolean removeWhileAdaptingLevel(Skill skill) {
            boolean keep = true;
            if (seenSkills.containsKey(skill.getName())) {
                Skill concurrentSkill = seenSkills.get(skill.getName());
                if (concurrentSkill.getRating() <= skill.getRating()) {
                    concurrentSkill.setRating(skill.getRating());
                }
                keep = false;
            }
            seenSkills.put(skill.getName(), skill);
            return keep;
        }
    }
}
