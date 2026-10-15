package de.hbt.pwr.profile.data;

import de.hbt.pwr.profile.model.notification.AdminNotification;
import de.hbt.pwr.profile.model.notification.AdminNotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    @Query("delete from SkillNotification s where s.skill.name = :skillName")
    void deleteBySkillName(@Param("skillName") String skillName);


    void deleteAdminNotificationsByProfileId(Long id);

    void deleteByAdminNotificationStatus(AdminNotificationStatus status);

    Collection<AdminNotification> findAllByAdminNotificationStatus(AdminNotificationStatus status);
}
