package de.hbt.pwr.view.model.skill;

import de.hbt.pwr.view.model.entries.ToggleableEntry;
import de.hbt.pwr.view.model.entries.sort.NameComparable;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@EqualsAndHashCode(exclude = {"enabled"})
@ToString

public class SkillVersion implements ToggleableEntry, NameComparable {
    private String name;
    private Boolean enabled;

    public SkillVersion(String name, Boolean enabled) {
        this.name = name;
        this.enabled = enabled;
    }
}
