package de.hbt.pwr.model.profile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import de.hbt.pwr.model.profile.entries.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
public class Profile {

    private Long id;

    private String description;

    private LocalDateTime lastEdited;

    private Set<LanguageSkill> languages = new HashSet<>();

    private Set<QualificationEntry> qualification = new HashSet<>();

    private Set<TrainingEntry> trainingEntries = new HashSet<>();

    private Set<EducationEntry> education = new HashSet<>();

    private Set<SectorEntry> sectors = new HashSet<>();

    private Set<CareerEntry> careerEntries = new HashSet<>();

    private Set<KeySkillEntry> keySkillEntries = new HashSet<>();

    private Set<Project> projects = new HashSet<>();

    private Set<Skill> skills = new HashSet<>();

    /**
     * Defines if the profile should be treated as 'frozen' or not. A frozen profile may not
     * be mutated by an API operation.
     * This value should not be mutated from an outside source, so it has to be ignored by the json
     * serializer/deserializer
     */
    @JsonIgnore
    private boolean frozen = false;

    public Profile() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<LanguageSkill> getLanguages() {
        return languages;
    }

    public void setLanguages(Set<LanguageSkill> languages) {
        this.languages = languages;
    }

    public Set<QualificationEntry> getQualification() {
        return qualification;
    }

    public void setQualification(Set<QualificationEntry> qualification) {
        this.qualification = qualification;
    }

    public Set<TrainingEntry> getTrainingEntries() {
        return trainingEntries;
    }

    public void setTrainingEntries(Set<TrainingEntry> trainingEntries) {
        this.trainingEntries = trainingEntries;
    }

    public Set<EducationEntry> getEducation() {
        return education;
    }

    public void setEducation(Set<EducationEntry> education) {
        this.education = education;
    }

    public Set<SectorEntry> getSectors() {
        return sectors;
    }

    public void setSectors(Set<SectorEntry> sectors) {
        this.sectors = sectors;
    }

    public Set<Project> getProjects() {
        return projects;
    }

    public void setProjects(Set<Project> projects) {
        this.projects = projects;
    }

    public Set<Skill> getSkills() {
        return skills;
    }

    public void setSkills(Set<Skill> skills) {
        this.skills = skills;
    }


    public boolean isFrozen() {
        return frozen;
    }

    public void setFrozen(boolean frozen) {
        this.frozen = frozen;
    }

    public LocalDateTime getLastEdited() {
        return lastEdited;
    }

    public void setLastEdited(LocalDateTime lastEdited) {
        this.lastEdited = lastEdited;
    }

    public Set<CareerEntry> getCareerEntries() {
        return careerEntries;
    }

    public void setCareerEntries(Set<CareerEntry> careerEntries) {
        this.careerEntries = careerEntries;
    }

    public Set<KeySkillEntry> getKeySkillEntries() {
        return keySkillEntries;
    }

    public void setKeySkillEntries(Set<KeySkillEntry> keySkillEntries) {
        this.keySkillEntries = keySkillEntries;
    }
}
