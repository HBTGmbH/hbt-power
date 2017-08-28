package de.hbt.pwr.view.client.profile.model;

import lombok.Data;

import java.time.LocalDate;

@Data
public class StepEntry extends ProfileEntry {
    protected LocalDate startDate;
    protected LocalDate endDate;
}
