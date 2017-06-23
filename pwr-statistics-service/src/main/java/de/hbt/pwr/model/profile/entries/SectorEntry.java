package de.hbt.pwr.model.profile.entries;

import de.hbt.pwr.model.profile.NameEntity;

public class SectorEntry extends ProfileEntry {

    public SectorEntry() {
    }

    public SectorEntry(Long id, NameEntity sector) {
        this.id = id;
        this.nameEntity = sector;
    }

    @Override
    public String toString() {
        return "SectorEntry{" +
                "hash=" + this.hashCode() +
                ", Id=" + id +
                '}';
    }


}
