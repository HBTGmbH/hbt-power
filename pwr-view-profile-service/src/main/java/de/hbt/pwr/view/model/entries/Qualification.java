package de.hbt.pwr.view.model.entries;

import lombok.Data;

import java.time.LocalDate;

@Data
public class Qualification implements ToggleableEntry{
    private String name;
    private LocalDate date;
    private Boolean enabled;


    public Qualification() {
    }

    public Qualification(String name, LocalDate date, Boolean enabled) {
        this.name = name;
        this.date = date;
        this.enabled = enabled;
    }

}
