package de.hbt.pwr.view.model.entries;

import lombok.Data;

import java.time.LocalDate;

@Data
public class Training implements ToggleableEntry {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean enabled;

    public Training() {

    }

    public Training(String name, LocalDate startDate, LocalDate endDate, Boolean enabled) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.enabled = enabled;
    }
}
