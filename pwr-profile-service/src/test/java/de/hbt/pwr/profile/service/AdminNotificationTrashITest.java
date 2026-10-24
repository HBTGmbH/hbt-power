package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.AbstractIntegrationTest;
import de.hbt.pwr.profile.data.AdminNotificationRepository;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.model.notification.AdminNotification;
import de.hbt.pwr.profile.model.notification.ProfileUpdatedNotification;
import de.hbt.pwr.profile.model.profile.Profile;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import static de.hbt.pwr.profile.model.notification.AdminNotificationStatus.TRASHED;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Emptying the trash (#257). Without a transaction of the test, like a request: one around the test would hide a
 * missing transaction of the service.
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
public class AdminNotificationTrashITest extends AbstractIntegrationTest {

    @Autowired
    private AdminNotificationService adminNotificationService;

    @Autowired
    private AdminNotificationRepository adminNotificationRepository;

    @Autowired
    private ProfileRepository profileRepository;

    private Profile profile;
    private AdminNotification trashed;
    private AdminNotification alive;

    @Before
    public void createNotifications() {
        profile = profileRepository.save(Profile.empty());
        trashed = new ProfileUpdatedNotification(profile);
        trashed.setAdminNotificationStatus(TRASHED);
        trashed = adminNotificationRepository.save(trashed);
        alive = adminNotificationRepository.save(new ProfileUpdatedNotification(profile));
    }

    @After
    public void deleteNotifications() {
        adminNotificationRepository.findById(trashed.getId()).ifPresent(adminNotificationRepository::delete);
        adminNotificationRepository.findById(alive.getId()).ifPresent(adminNotificationRepository::delete);
        profileRepository.deleteById(profile.getId());
    }

    @Test
    public void emptyingTheTrashDeletesOnlyTheTrashedNotifications() {
        adminNotificationService.trashAllDeleted();

        assertThat(adminNotificationRepository.findById(trashed.getId())).isEmpty();
        assertThat(adminNotificationRepository.findById(alive.getId())).isPresent();
    }
}
