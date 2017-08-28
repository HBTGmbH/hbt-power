package de.hbt.pwr.view.model.entries;

import lombok.Data;

@Data
public class KeySkill implements ToggleableEntry {
    private String name;
    private Boolean enabled;

    public KeySkill() {
    }

    public KeySkill(String name, Boolean enabled) {
        this.name = name;
        this.enabled = enabled;
    }
}
