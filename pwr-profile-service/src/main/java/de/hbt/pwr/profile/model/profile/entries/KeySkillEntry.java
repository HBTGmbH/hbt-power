package de.hbt.pwr.profile.model.profile.entries;

import javax.persistence.Entity;

@Entity
public class KeySkillEntry extends ProfileEntry {

    public KeySkillEntry() {
    }

    public KeySkillEntry(NameEntity nameEntity) {
        this.nameEntity = nameEntity;
    }

    @Override
    public KeySkillEntry copyNullId() {
        return new KeySkillEntry(nameEntity);
    }
}
