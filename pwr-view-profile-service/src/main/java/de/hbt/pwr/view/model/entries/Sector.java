package de.hbt.pwr.view.model.entries;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sector implements ToggleableEntry {
    private String name;
    private Boolean enabled;
}
