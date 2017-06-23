package de.hbt.pwr.model.profile.entries;

import de.hbt.pwr.model.profile.NameEntity;

public abstract class ProfileEntry {
    protected Long id;

    protected NameEntity nameEntity;

    public ProfileEntry() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public NameEntity getNameEntity() {
        return nameEntity;
    }

    public void setNameEntity(NameEntity nameEntity) {
        this.nameEntity = nameEntity;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ProfileEntry that = (ProfileEntry) o;

        if (id != null ? !id.equals(that.id) : that.id != null) return false;
        return nameEntity != null ? nameEntity.equals(that.nameEntity) : that.nameEntity == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (nameEntity != null ? nameEntity.hashCode() : 0);
        return result;
    }
}
