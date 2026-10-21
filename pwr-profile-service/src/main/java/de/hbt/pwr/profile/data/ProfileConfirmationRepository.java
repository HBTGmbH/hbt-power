package de.hbt.pwr.profile.data;

import de.hbt.pwr.profile.model.check.ProfileConfirmation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProfileConfirmationRepository extends JpaRepository<ProfileConfirmation, Long> {

    List<ProfileConfirmation> findByProfileIdOrderByConfirmedAtDesc(Long profileId);
}
