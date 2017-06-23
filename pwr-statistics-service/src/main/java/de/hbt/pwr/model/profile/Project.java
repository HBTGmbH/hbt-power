package de.hbt.pwr.model.profile;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

public class Project {

    private Long Id;

    /**
     * Name of the project. Defined by the consultant participating in the project.
     */
    private String name;

    /**
     * The official customer for which the project was done. This is the company that issued
     * the project, not the company for which the project was done. The company hosting the project
     * is the broker.
     */
    private NameEntity client;

    /**
     * The company(or individual) under whose name the project contract is issued. May be equal to the {@link Project#client}.
     */
    private NameEntity broker;

    /**
     * All roles the consultant had during the project.
     */
    private Set<NameEntity> projectRoles = new HashSet<>();

    /**
     * Skills of a project. Skills occuring in a project need to occur in the profile, too.
     */
    private Set<Skill> skills = new HashSet<>();

    private LocalDate startDate;

    private LocalDate endDate;

    private String description;

    public Project() {
    }

    public Long getId() {
        return Id;
    }

    public void setId(Long id) {
        Id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public NameEntity getClient() {
        return client;
    }

    public void setClient(NameEntity client) {
        this.client = client;
    }

    public NameEntity getBroker() {
        return broker;
    }

    public void setBroker(NameEntity broker) {
        this.broker = broker;
    }

    public Set<NameEntity> getProjectRoles() {
        return projectRoles;
    }

    public void setProjectRoles(Set<NameEntity> projectRole) {
        this.projectRoles = projectRole;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Skill> getSkills() {
        return skills;
    }

    public void setSkills(Set<Skill> skills) {
        this.skills = skills;
    }
}
