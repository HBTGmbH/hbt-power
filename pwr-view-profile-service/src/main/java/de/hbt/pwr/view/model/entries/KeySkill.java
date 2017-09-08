package de.hbt.pwr.view.model.entries;

import de.hbt.pwr.view.model.entries.sort.NameComparable;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KeySkill implements ToggleableEntry, NameComparable {
    private String name;
    private Boolean enabled;
}
