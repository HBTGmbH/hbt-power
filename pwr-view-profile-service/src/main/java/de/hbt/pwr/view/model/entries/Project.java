package de.hbt.pwr.view.model.entries;

import de.hbt.pwr.view.model.entries.sort.StartEndDateComparable;
import de.hbt.pwr.view.model.skill.Skill;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
public class Project implements ToggleableEntry, StartEndDateComparable {
    private String name;
    private String description;
    private String client;
    private String broker;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<ProjectRole> projectRoles = new ArrayList<>();
    private List<Skill> skills = new ArrayList<>();
    private Boolean enabled;

    public Project(String name, String description, String client, String broker, LocalDate startDate, LocalDate endDate, List<ProjectRole> projectRoles, List<Skill> skills, Boolean enabled) {
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
