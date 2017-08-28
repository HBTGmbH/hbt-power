package de.hbt.pwr.view.model.entries;

import javafx.scene.control.Toggle;
import lombok.Data;

@Data
public class Sector implements ToggleableEntry {
    private String name;
    private Boolean enabled;

    public Sector(String name, Boolean enabled) {
        this.name = name;
        this.enabled = enabled;
    }
}
