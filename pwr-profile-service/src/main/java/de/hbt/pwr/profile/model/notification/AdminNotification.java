package de.hbt.pwr.profile.model.notification;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import de.hbt.pwr.profile.data.jsonserializers.AdminNotificationDeSerializer;
import de.hbt.pwr.profile.data.jsonserializers.AdminNotificationSerializer;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.service.AdminNotificationService;

import javax.persistence.*;
import java.io.IOException;
import java.time.LocalDateTime;

/**
 * To implement a new type of AdminNotification simply extend this abstract class. Add the needed attributes.
 * Add the new attributes to the existing {@link AdminNotification#addCustomJSON(JsonGenerator) customJson}.
 * And lastly implement the three executeActions ({@link AdminNotification#executeOKAction(AdminNotificationService) ok},
 * {@link AdminNotification#executeDeleteAction(AdminNotificationService) delete},
 * {@link {@link AdminNotification#executeEditAction(AdminNotificationService) edit})
 */
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@JsonSerialize(using = AdminNotificationSerializer.class)
@JsonDeserialize(using = AdminNotificationDeSerializer.class)
public abstract class AdminNotification {

    @Id
    @GeneratedValue
    protected Long id;

    /**
     * The profile that triggered this notification
     */
    @ManyToOne(optional = true)
    protected Profile profile;

    @Enumerated(EnumType.STRING)
    protected AdminNotificationReason reason;

    @Enumerated(EnumType.STRING)
    protected AdminNotificationStatus adminNotificationStatus;

    /**
     * The notification was generated at this time.
     */
    protected LocalDateTime timeOfOccurrence;

    public AdminNotification(Profile profile, AdminNotificationReason reason, AdminNotificationStatus adminNotificationStatus, LocalDateTime timeOfOccurrence) {
        this.profile = profile;
        this.reason = reason;
        this.adminNotificationStatus = adminNotificationStatus;
        this.timeOfOccurrence = timeOfOccurrence;
    }

    protected AdminNotification() {
    }

    public abstract String getNotificationType();

    public void addCustomJSON(JsonGenerator generator) throws IOException {
        generator.writeNumberField("profileId", profile.getId());
    }


    public abstract void executeOKAction(AdminNotificationService service);

    public abstract void executeDeleteAction(AdminNotificationService service);

    public abstract void executeEditAction(AdminNotificationService service);

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Profile getProfile() {
        return profile;
    }

    public void setProfile(Profile profile) {
        this.profile = profile;
    }

    public AdminNotificationReason getReason() {
        return reason;
    }

    public void setReason(AdminNotificationReason reason) {
        this.reason = reason;
    }

    public LocalDateTime getTimeOfOccurrence() {
        return timeOfOccurrence;
    }

    public void setTimeOfOccurrence(LocalDateTime timeOfOccurrence) {
        this.timeOfOccurrence = timeOfOccurrence;
    }

    public AdminNotificationStatus getAdminNotificationStatus() {
        return adminNotificationStatus;
    }

    public void setAdminNotificationStatus(AdminNotificationStatus adminNotificationStatus) {
        this.adminNotificationStatus = adminNotificationStatus;
    }
}
