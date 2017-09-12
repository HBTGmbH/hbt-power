package de.hbt.pwr.view.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import de.hbt.pwr.view.model.entries.*;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("viewProfile")
public class ViewProfile {

    private String id;

    private String viewDescription = "";

    @JsonProperty("owner")
    private String ownerInitials;

    private String name = "";

    private String description = "";

    private LocalDate creationDate;

    private Locale locale;

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
     */
    private Category rootCategory;

    private Optional<Skill> findSkillByName(Category category, String name) {
        Optional<Skill> skill = category.getSkills().stream().filter(skill1 -> name.equals(skill1.getName())).findAny();
        if(skill.isPresent()) {
            return skill;
        } else {
            Optional<Skill> tmp = Optional.empty();
            for (Category child : category.getChildren()) {
                tmp = findSkillByName(child, name);
                if (tmp.isPresent()) {
                    return tmp;
                }
            }
            return tmp;
        }
    }

    public Optional<Skill> findSkillByName(String name) {
        return findSkillByName(rootCategory, name);
    }

    public static class ViewProfileStub {
        public String viewDescription;
        public String name;
        public String locale;
    }
}
