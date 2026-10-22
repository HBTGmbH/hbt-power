package de.hbt.pwr.profile.config;

import de.hbt.pwr.profile.model.check.ProfileSection;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Set;

/**
 * Thresholds of the profile check (#139), set in application.yml under profile-check
 */
@Data
@Component
@ConfigurationProperties(prefix = "profile-check")
public class ProfileCheckProperties {

    /**
     * Sections that must have at least one entry
     */
    private Set<ProfileSection> requiredSections = EnumSet.of(ProfileSection.LANGUAGES, ProfileSection.EDUCATION,
            ProfileSection.CAREER, ProfileSection.TRAININGS, ProfileSection.SECTORS, ProfileSection.SKILLS,
            ProfileSection.PROJECTS);

    /**
     * The description (advertising text) is too short below this many characters
     */
    private int minDescriptionLength = 300;

    /**
     * A project reference is incomplete below this many skills
     */
    private int minProjectSkills = 5;

    /**
     * A project reference is incomplete below this many characters of description
     */
    private int minProjectDescriptionLength = 500;

    /**
     * The project references are outdated if none was saved for this many months (wish: once a year)
     */
    private int projectsMaxAgeMonths = 12;

    /**
     * A running project (no end) is outdated if it wasn't saved for this many months
     */
    private int runningProjectMaxAgeMonths = 12;

    /**
     * After the end of the last project reference, a follow-up project is expected within this many months
     */
    private int followUpProjectMonths = 3;

    /**
     * The skills are outdated if they weren't changed for this many months (wish: every six months)
     */
    private int skillsMaxAgeMonths = 6;
}
