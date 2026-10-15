package de.hbt.pwr.profile.data;

import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    @Query("select p from Profile p where exists " +
            "(select entry from ProfileEntry entry where entry.nameEntity = :nameEntity)")
    Collection<Profile> findReferencedBy(@Param("nameEntity") NameEntity nameEntity);
}
