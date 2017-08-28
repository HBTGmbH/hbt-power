package de.hbt.pwr.view.model.entries;


import lombok.Data;

import java.time.LocalDate;

@Data
public class Education implements ToggleableEntry {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String degree;
    private Boolean enabled;

    public Education() {
    }

    public Education(String name, LocalDate startDate, LocalDate endDate, String degree, Boolean enabled) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.degree = degree;
        this.enabled = enabled;
    }
}
