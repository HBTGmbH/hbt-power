package de.hbt.pwr.profile.model.notification;

import com.fasterxml.jackson.core.JsonGenerator;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.service.AdminNotificationService;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import java.io.IOException;
import java.time.LocalDateTime;

@Entity
public class ProfileEntryNotification extends AdminNotification {
    private Long profileEntryId;
    @ManyToOne
    private NameEntity nameEntity;

    public ProfileEntryNotification(Profile profile, Long profileEntryId, NameEntity nameEntity) {
        super(profile, AdminNotificationReason.NAME_ENTITY_ADDED, AdminNotificationStatus.ALIVE, LocalDateTime.now());
        this.profileEntryId = profileEntryId;
        this.nameEntity = nameEntity;
    }

    public ProfileEntryNotification(Long profileEntryId) {
        this.profileEntryId = profileEntryId;
    }

    public ProfileEntryNotification() {
    }

    public Long getProfileEntryId() {
        return profileEntryId;
    }

    public void setProfileEntryId(Long profileEntryId) {
        this.profileEntryId = profileEntryId;
    }

    public NameEntity getNameEntity() {
        return nameEntity;
    }

    public void setNameEntity(NameEntity nameEntity) {
        this.nameEntity = nameEntity;
    }

    @Override
    public String getNotificationType() {
        return this.getClass().getSimpleName();
    }

    @Override
    public void addCustomJSON(JsonGenerator generator) throws IOException {
        super.addCustomJSON(generator);
        generator.writeNumberField("profileEntryId", profileEntryId);
        generator.writeObjectField("nameEntity", nameEntity);
    }

    @Override
    public void executeOKAction(AdminNotificationService service) {
        service.deleteNotification(this);
    }

    @Override
    public void executeDeleteAction(AdminNotificationService service) {
        service.deleteEntryAndNameEntity(nameEntity, this);
    }

    @Override
    public void executeEditAction(AdminNotificationService service) {
        service.fixNameEntity(profileEntryId, nameEntity, this);
    }
}
