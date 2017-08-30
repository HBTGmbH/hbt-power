package de.hbt.pwr.view.client.profile.model;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class QualificationEntry extends ProfileEntry {
    private LocalDate date;
}
