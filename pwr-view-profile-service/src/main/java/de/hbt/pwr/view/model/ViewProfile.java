package de.hbt.pwr.view.model;

import de.hbt.pwr.view.model.entries.*;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.data.redis.core.RedisHash;

import java.util.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("viewProfile")
public class ViewProfile {

    private static final Logger LOG = LogManager.getLogger(ViewProfile.class);

    private String id;

    private Locale locale;

    private String description = "";

    private ViewProfileInfo viewProfileInfo = new ViewProfileInfo();

    private List<Career> careers = new ArrayList<>();

    private List<Education> educations = new ArrayList<>();

    private List<KeySkill> keySkills = new ArrayList<>();

    private List<Language> languages = new ArrayList<>();

    private List<Qualification> qualifications = new ArrayList<>();

    private List<Sector> sectors = new ArrayList<>();

    private List<Training> trainings = new ArrayList<>();

    private List<ProjectRole> projectRoles = new ArrayList<>();

    private List<Project> projects = new ArrayList<>();

    private List<Category> displayCategories = new ArrayList<>();

    /**
     * Versions of the skills in the export (#151). Off hides all of them; the choice per version stays as it is.
     * View profiles stored before lack it, {@link de.hbt.pwr.view.aspects.ViewProfileRestoreAspect} sets it to true.
     */
    private Boolean showSkillVersions = true;

    /**
     * ISO 639-2 code of the language the skill and category names are shown in (#174), null for the names of the
     * skill tree. Not {@link #locale}: that one says German for every view profile stored before, without a choice.
     */
    private String localization;

    public Optional<Skill> findSkillByName(String name) {
        return this.displayCategories.stream()
                .map(category -> category.getDisplaySkills().stream()
                        .filter(skill -> skill.getName().equals(name))
                        .findFirst().orElse(null)
                ).filter(Objects::nonNull)
                .findFirst();
    }

    public static class ViewProfileStub {
        public String viewDescription;
        public String name;
        public String locale;
        /** Language of the skill and category names (#174), see {@link ViewProfile#getLocalization()} */
        public String localization;
    }
}
