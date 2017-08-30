package de.hbt.pwr.view.model.entries;

import de.hbt.pwr.view.model.entries.sort.NameComparable;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
public class KeySkill implements ToggleableEntry, NameComparable {
    private String name;
    private Boolean enabled;

    public KeySkill(String name, Boolean enabled) {
        this.name = name;
        this.enabled = enabled;
    }
}
