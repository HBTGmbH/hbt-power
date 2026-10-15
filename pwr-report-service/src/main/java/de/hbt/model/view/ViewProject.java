package de.hbt.model.view;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ViewProject implements ViewEntry {
    private Long id;
    private String name;
    private String description;
    private String client;
    private String broker;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<ViewProjectRole> projectRoles = new ArrayList<>();
    private List<ViewSkill> skills = new ArrayList<>();
    private Boolean enabled;

    public ViewProject() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getClient() {
        return client;
    }

    public void setClient(String client) {
        this.client = client;
    }

    public String getBroker() {
        return broker;
    }

    public void setBroker(String broker) {
        this.broker = broker;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public List<ViewProjectRole> getProjectRoles() {
        return projectRoles;
    }

    public void setProjectRoles(List<ViewProjectRole> projectRoles) {
        this.projectRoles = projectRoles;
    }

    public List<ViewSkill> getSkills() {
        return skills;
    }

    public void setSkills(List<ViewSkill> skills) {
        this.skills = skills;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}
