package de.hbt.pwr.profile.model.profile.entries;

import de.hbt.pwr.profile.model.Skill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Builder
@AllArgsConstructor
public class Project {

    @javax.persistence.Id
    @GeneratedValue
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
    @Cascade(value = {CascadeType.SAVE_UPDATE})
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

    @Override
    public String toString() {
        return "Project{" +
                "Id=" + Id +
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
