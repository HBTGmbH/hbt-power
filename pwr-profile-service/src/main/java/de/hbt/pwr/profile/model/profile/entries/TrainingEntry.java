package de.hbt.pwr.profile.model.profile.entries;

import lombok.Builder;

import javax.persistence.Entity;
import java.time.LocalDate;

@Entity
public class TrainingEntry extends CareerElement {

    public TrainingEntry() {

    }

    @Builder
    public TrainingEntry(Long id, NameEntity training, LocalDate startDate, LocalDate endDate) {
        this.id = id;
        this.nameEntity = training;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public TrainingEntry(NameEntity nameEntity, LocalDate startDate, LocalDate endDate) {
        super(nameEntity, startDate, endDate);
    }

    @Override
    public TrainingEntry copyNullId() {
        return new TrainingEntry(null, nameEntity, startDate, endDate);
    }
}
