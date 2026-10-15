package de.hbt.pwr.profile.data;

import de.hbt.pwr.profile.model.profile.entries.LanguageSkill;
import de.hbt.pwr.profile.model.profile.entries.ProfileEntry;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;


@Repository
@Transactional
public class ProfileEntryDAO {

    @PersistenceContext
    protected EntityManager entityManager;


    public <T extends ProfileEntry> T update(final T skill) {
        return entityManager.merge(skill);
    }

    public <T extends ProfileEntry> T persist(final T entry) {
        entityManager.persist(entry);
        return entry;
    }

    public <T extends ProfileEntry> T find(final Long id, final Class<T> clazz) {
        return this.entityManager.find(clazz, id);
    }

    public LanguageSkill findLanguageSkill(final Long id) {
        return this.entityManager.find(LanguageSkill.class, id);
    }


    public <T extends ProfileEntry> void remove(final T entry) {
        this.entityManager.remove(this.entityManager.getReference(entry.getClass(), entry.getId()));
    }

    public void remove(final Long id, Class<?> clazz) {
        this.entityManager.remove(this.entityManager.getReference(clazz, id));
    }

}
