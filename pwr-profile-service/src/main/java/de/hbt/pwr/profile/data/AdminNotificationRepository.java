package de.hbt.pwr.profile.data;

import de.hbt.pwr.profile.model.notification.ProjectNotification;
import de.hbt.pwr.profile.model.profile.entries.Project;
import de.hbt.pwr.profile.model.notification.AdminNotification;
import de.hbt.pwr.profile.model.notification.AdminNotificationStatus;
import de.hbt.pwr.profile.model.notification.SkillNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    /**
     * Loaded instead of a bulk delete (#187): a skill notification spans two tables (JOINED), only deleting the
     * entities removes both rows
     */
    @Query("select s from SkillNotification s where s.skill.name = :skillName")
    List<SkillNotification> findSkillNotificationsBySkillName(@Param("skillName") String skillName);


    void deleteAdminNotificationsByProfileId(Long id);

    @Query("select n from ProjectNotification n where n.project in :projects")
    List<ProjectNotification> findProjectNotificationsAbout(@Param("projects") Collection<Project> projects);

    void deleteByAdminNotificationStatus(AdminNotificationStatus status);

    Collection<AdminNotification> findAllByAdminNotificationStatus(AdminNotificationStatus status);
}
