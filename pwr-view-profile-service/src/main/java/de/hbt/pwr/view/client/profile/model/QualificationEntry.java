package de.hbt.pwr.view.client.profile.model;

import lombok.Data;

import java.time.LocalDate;

@Data
public class QualificationEntry extends ProfileEntry {
    private LocalDate date;
}
