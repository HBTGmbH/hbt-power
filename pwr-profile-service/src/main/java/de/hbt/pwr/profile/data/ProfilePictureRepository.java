package de.hbt.pwr.profile.data;

import de.hbt.pwr.profile.model.ProfilePicture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfilePictureRepository extends JpaRepository<ProfilePicture, String> {

    @Query("select p from Consultant c " +
            "join ProfilePicture p on p.id = c.profilePictureId " +
            "where c.initials = :initials")
    Optional<ProfilePicture> findByInitials(@Param("initials") String initials);
}
