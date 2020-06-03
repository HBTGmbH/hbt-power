package de.hbt.pwr.profile.model.profile.entries;

import javax.persistence.*;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class ProfileEntry {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    @ManyToOne
    protected NameEntity nameEntity;

    public ProfileEntry() {
    }

    public ProfileEntry(NameEntity nameEntity) {
        this.nameEntity = nameEntity;
    }

    /**
     * Returns a shallow copy of this instance, but <bold>with it's id set to <code>null</code>!</bold>
     * <p>
     * The {@link ProfileEntry#nameEntity} is not copied and also not id-nulled. Other values are not cloned either.
     * </p>
     * <p>
     * Purpose of this is to create new entities on a cascade persist.
     * </p>
     *
     * @return a shallow copy with its id set to null.
     */
    public abstract ProfileEntry copyNullId();

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
