package de.hbt.pwr.profile.data;

import de.hbt.pwr.profile.model.Consultant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConsultantRepository extends JpaRepository<Consultant, Long> {
    boolean existsByInitials(String initials);

    Optional<Consultant> findByInitials(String initials);

    Optional<Consultant> findByProfileId(Long profileId);
}
