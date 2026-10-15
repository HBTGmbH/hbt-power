package de.hbt.pwr.profile.model.profile.entries;

import javax.persistence.Entity;

@Entity
public class SectorEntry extends ProfileEntry {

    public SectorEntry() {
    }

    public SectorEntry(NameEntity nameEntity) {
        this.nameEntity = nameEntity;
    }

    @Override
    public SectorEntry copyNullId() {
        return new SectorEntry(nameEntity);
    }

    public SectorEntry(Long id, NameEntity sector) {
        this.id = id;
        this.nameEntity = sector;
    }

    @Override
    public String toString() {
        return "SectorEntry{" +
                "hash=" + this.hashCode() +
                ", id=" + id +
                '}';
    }


}
