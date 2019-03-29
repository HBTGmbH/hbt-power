package de.hbt.pwr.profile.model.profile.entries;

import lombok.Builder;

import javax.persistence.Entity;
import java.time.LocalDate;

@Entity
@Builder
public class CareerEntry extends CareerElement {

    public CareerEntry() {

    }

    public CareerEntry(NameEntity nameEntity, LocalDate startDate, LocalDate endDate) {
        super(nameEntity, startDate, endDate);
    }

    @Override
    public CareerEntry copyNullId() {
        return new CareerEntry(nameEntity, startDate, endDate);
    }
}
