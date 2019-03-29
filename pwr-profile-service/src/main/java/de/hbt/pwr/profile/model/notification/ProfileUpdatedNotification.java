package de.hbt.pwr.profile.model.notification;

import com.fasterxml.jackson.core.JsonGenerator;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.service.AdminNotificationService;

import javax.persistence.Entity;
import java.io.IOException;
import java.time.LocalDateTime;

@Entity
public class ProfileUpdatedNotification extends AdminNotification {

    public ProfileUpdatedNotification(Profile profile) {
        super(profile, AdminNotificationReason.PROFILE_UPDATED, AdminNotificationStatus.ALIVE, LocalDateTime.now());
    }

    public ProfileUpdatedNotification() {
    }

    @Override
    public String getNotificationType() {
        return this.getClass().getSimpleName();
    }

    @Override
    public void addCustomJSON(JsonGenerator generator) throws IOException {
        super.addCustomJSON(generator);
    }

    @Override
    public void executeOKAction(AdminNotificationService service) {
        service.deleteNotification(this);
    }

    @Override
    public void executeDeleteAction(AdminNotificationService service) {
        throw new UnsupportedOperationException();

    }

    @Override
    public void executeEditAction(AdminNotificationService service) {
        throw new UnsupportedOperationException();
    }

}
