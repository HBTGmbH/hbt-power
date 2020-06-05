package de.hbt.model.view;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class ViewProfile {
    private String id;
    private String viewDescription = "";
    @JsonProperty("owner")
    private String ownerInitials;
    private ViewProfileInfo viewProfileInfo = new ViewProfileInfo();
    private String description = "";
    private LocalDate creationDate;
    private Locale locale;

    private List<ViewCareer> careers = new ArrayList<>();

    private List<ViewEducation> educations = new ArrayList<>();

    private List<ViewKeySkill> keySkills = new ArrayList<>();

    private List<ViewLanguage> languages = new ArrayList<>();

    private List<ViewQualification> qualifications = new ArrayList<>();

    private List<ViewSector> sectors = new ArrayList<>();

    private List<ViewTraining> trainings = new ArrayList<>();

    private List<ViewProjectRole> projectRoles = new ArrayList<>();

    private List<ViewProject> projects = new ArrayList<>();

    private List<ViewCategory> displayCategories = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getViewDescription() {
        return viewDescription;
    }

    public void setViewDescription(String viewDescription) {
        this.viewDescription = viewDescription;
    }

    public String getOwnerInitials() {
        return ownerInitials;
    }

    public void setOwnerInitials(String ownerInitials) {
        this.ownerInitials = ownerInitials;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDate creationDate) {
        this.creationDate = creationDate;
    }

    public Locale getLocale() {
        return locale;
    }

    public void setLocale(Locale locale) {
        this.locale = locale;
    }

    public List<ViewCareer> getCareers() {
        return careers;
    }

    public void setCareers(List<ViewCareer> careers) {
        this.careers = careers;
    }

    public List<ViewEducation> getEducations() {
        return educations;
    }

    public void setEducations(List<ViewEducation> educations) {
        this.educations = educations;
    }

    public List<ViewKeySkill> getKeySkills() {
        return keySkills;
    }

    public void setKeySkills(List<ViewKeySkill> keySkills) {
        this.keySkills = keySkills;
    }

    public List<ViewLanguage> getLanguages() {
        return languages;
    }

    public void setLanguages(List<ViewLanguage> languages) {
        this.languages = languages;
    }

    public List<ViewQualification> getQualifications() {
        return qualifications;
    }

    public void setQualifications(List<ViewQualification> qualifications) {
        this.qualifications = qualifications;
    }

    public List<ViewSector> getSectors() {
        return sectors;
    }

    public void setSectors(List<ViewSector> sectors) {
        this.sectors = sectors;
    }

    public List<ViewTraining> getTrainings() {
        return trainings;
    }

    public void setTrainings(List<ViewTraining> trainings) {
        this.trainings = trainings;
    }

    public List<ViewProjectRole> getProjectRoles() {
        return projectRoles;
    }

    public void setProjectRoles(List<ViewProjectRole> projectRoles) {
        this.projectRoles = projectRoles;
    }

    public List<ViewProject> getProjects() {
        return projects;
    }

    public void setProjects(List<ViewProject> projects) {
        this.projects = projects;
    }

    public List<ViewCategory> getDisplayCategories() {
        return displayCategories;
    }

    public void setDisplayCategories(List<ViewCategory> displayCategories) {
        this.displayCategories = displayCategories;
    }

}
