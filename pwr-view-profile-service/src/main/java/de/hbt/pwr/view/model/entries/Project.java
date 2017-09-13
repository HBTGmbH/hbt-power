package de.hbt.pwr.view.model.entries;

import de.hbt.pwr.view.model.entries.sort.StartEndDateComparable;
import de.hbt.pwr.view.model.skill.Skill;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@EqualsAndHashCode(exclude = {"projectRoles", "skills"})
public class Project implements ToggleableEntry, StartEndDateComparable {
    private Long id;
    private String name;
    private String description;
    private String client;
    private String broker;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<ProjectRole> projectRoles = new ArrayList<>();
    private List<Skill> skills = new ArrayList<>();
    private Boolean enabled;

    public Project(Long id, String name, String description, String client, String broker, LocalDate startDate, LocalDate endDate, List<ProjectRole> projectRoles, List<Skill> skills, Boolean enabled) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.client = client;
        this.broker = broker;
        this.startDate = startDate;
        this.endDate = endDate;
        this.projectRoles = projectRoles;
        this.skills = skills;
        this.enabled = enabled;
    }
}
