package de.hbt.pwr.profile.model.profile.entries;

import javax.persistence.Entity;

@Entity
public class SpecialFieldEntry extends ProfileEntry {

    public SpecialFieldEntry() {
    }

    public SpecialFieldEntry(NameEntity nameEntity) {
        this.nameEntity = nameEntity;
    }

    @Override
    public SpecialFieldEntry copyNullId() {
        return new SpecialFieldEntry(nameEntity);
    }
}
