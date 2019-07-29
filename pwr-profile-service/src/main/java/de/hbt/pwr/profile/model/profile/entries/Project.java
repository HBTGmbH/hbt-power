package de.hbt.pwr.profile.model.profile.entries;

import de.hbt.pwr.profile.model.Skill;
import lombok.AllArgsConstructor;
import lombok.Builder;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Builder(toBuilder = true)
@AllArgsConstructor
public class Project {

    @javax.persistence.Id
    @GeneratedValue
    private Long id;

    /**
     * Name of the project. Defined by the consultant participating in the project.
     */
    private String name;

    /**
     * The official customer for which the project was done. This is the company that issued
     * the project, not the company for which the project was done. The company hosting the project
     * is the broker.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    private NameEntity client;

    /**
     * The company(or individual) under whose name the project contract is issued. May be equal to the {@link Project#client}.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    private NameEntity broker;

    /**
     * All roles the consultant had during the project.
     */
    @ManyToMany(fetch = FetchType.EAGER)
    private Set<NameEntity> projectRoles = new HashSet<>();

    /**
     * Skills of a project. Skills occuring in a project need to occur in the profile, too.
     */
    @ManyToMany(fetch = FetchType.EAGER)
    private Set<Skill> skills = new HashSet<>();

    private LocalDate startDate;

    private LocalDate endDate;

    private String description;

    public Project(String name, NameEntity client, NameEntity broker, Set<NameEntity> projectRoles, Set<Skill> skills, LocalDate startDate, LocalDate endDate, String description) {
        this.name = name;
        this.client = client;
        this.broker = broker;
        this.projectRoles = projectRoles;
        this.skills = skills;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }

    public Project() {
    }

    public Project copyNullId() {
        Project res = new Project(name, client, broker, this.projectRoles, skills, startDate, endDate, description);
        res.setId(null);
        return res;
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
/*
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Project project = (Project) o;

        if (id != null ? !id.equals(project.id) : project.id != null) return false;
        if (name != null ? !name.equals(project.name) : project.name != null) return false;
        if (description != null ? !description.equals(project.description) : project.description != null) return false;
        if (client != null ? !client.equals(project.client) : project.client != null) return false;
        if (broker != null ? !broker.equals(project.broker) : project.broker != null) return false;
        if (projectRoles != null ? !projectRoles.equals(project.projectRoles) : project.projectRoles != null) return false;
        if (skills != null ? !skills.equals(project.skills) : project.skills != null) return false;
        if (startDate != null ? !startDate.equals(project.startDate) : project.startDate != null) return false;
        return endDate != null ? endDate.equals(project.endDate) : project.endDate == null;
    }




    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (name != null ? name.hashCode() : 0);
        result = 31 * result + (description != null ? description.hashCode() : 0);
        result = 31 * result + (client != null ? client.hashCode() : 0);
        result = 31 * result + (broker != null ? broker.hashCode() : 0);
        result = 31 * result + (projectRoles != null ? projectRoles.hashCode() : 0);
        result = 31 * result + (skills != null ? skills.hashCode() : 0);
        result = 31 * result + (startDate != null ? startDate.hashCode() : 0);
        result = 31 * result + (endDate != null ? endDate.hashCode() : 0);
        return result;
    }
    */

    @Override
    public String toString() {
        return "Project{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", client=" + client +
                ", broker=" + broker +
                ", projectRoles=" + projectRoles +
                ", skills=" + skills +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", description='" + description + '\'' +
                '}';
    }
}
