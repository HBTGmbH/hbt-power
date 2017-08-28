package de.hbt.pwr.view.model.entries;

import lombok.Data;

@Data
public class ProjectRole implements ToggleableEntry {
    private String name;
    private Boolean enabled;

    public ProjectRole(String name, Boolean enabled) {
        this.name = name;
        this.enabled = enabled;
    }

    public ProjectRole() {
    }
}
