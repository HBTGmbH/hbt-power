package de.hbt.pwr.view.client.profile.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
public class Profile {

    private Long id;

    private String description;

    @JsonIgnore
    private LocalDateTime lastEdited;

    private Set<LanguageSkill> languages = new HashSet<>();

    private Set<QualificationEntry> qualification = new HashSet<>();

    private Set<StepEntry> trainingEntries = new HashSet<>();

    private Set<EducationEntry> education = new HashSet<>();

    private Set<ProfileEntry> sectors = new HashSet<>();

    private Set<StepEntry> careerEntries = new HashSet<>();

    private Set<ProfileEntry> keySkillEntries = new HashSet<>();

    private Set<ProfileProject> projects = new HashSet<>();

    private Set<ProfileSkill> skills = new HashSet<>();
}
