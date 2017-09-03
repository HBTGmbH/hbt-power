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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("viewProfile")
public class ViewProfile {

    private String id;

    @JsonProperty("owner")
    private String ownerInitials;

    private String name;

    private String description;

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

    private List<Skill> skills = new ArrayList<>();

    private List<Category> displayCategories = new ArrayList<>();

    /**
     */
    private Category rootCategory;


}
