package de.hbt.pwr.view.model.entries;

import de.hbt.pwr.view.model.entries.sort.StartEndDateComparable;
import de.hbt.pwr.view.model.skill.Skill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"projectRoles", "skills", "localizedClient", "localizedBroker"})
@ToString(exclude = {"projectRoles", "skills"})
public class Project implements ToggleableEntry, StartEndDateComparable {
    private Long id;
    private String name;
    private String description;
    private String client;
    private String broker;
    /** Client and broker in the language of the view profile (#291), if the company has a localization for it */
    private String localizedClient;
    private String localizedBroker;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<ProjectRole> projectRoles = new ArrayList<>();
    private List<Skill> skills = new ArrayList<>();
    private Boolean enabled;

    /** Without localized names, as before #291 */
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
