package de.hbt.pwr.profile.data.jsonserializers;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.notification.*;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class AdminNotificationDeSerializer extends JsonDeserializer<AdminNotification> {

    private final ConsultantRepository consultantRepository;

    @Autowired
    public AdminNotificationDeSerializer(ConsultantRepository consultantRepository) {
        this.consultantRepository = consultantRepository;
    }

    private Profile fromInitials(String initials) {
        Optional<Consultant> consultantOptional = consultantRepository.findByInitials(initials);
        return consultantOptional.map(Consultant::getProfile).orElse(null);
    }

    private AdminNotification deserializeAsProfileEntryNotification(Root root) {
        ProfileEntryNotification res = new ProfileEntryNotification();
        res.setId(root.id);
        res.setProfileEntryId(root.profileEntryId);
        res.setProfile(fromInitials(root.initials));
        res.setAdminNotificationStatus(AdminNotificationStatus.ALIVE);
        res.setReason(root.reason);
        res.setTimeOfOccurrence(root.occurrence);
        res.setNameEntity(root.nameEntity);
        return res;
    }

    private AdminNotification deserializeAsProjectNotification(Root root) {
        ProjectNotification res = new ProjectNotification();
        return res;
    }

    private AdminNotification deserializeAsProfileUpdatedNotification(Root root) {
        ProfileUpdatedNotification res = new ProfileUpdatedNotification();
        res.setId(root.id);
        res.setProfile(fromInitials(root.initials));
        res.setAdminNotificationStatus(AdminNotificationStatus.ALIVE);
        res.setReason(root.reason);
        res.setTimeOfOccurrence(root.occurrence);
        return res;
    }

    private AdminNotification deserializeAsSkillNotification(Root root) {
        SkillNotification res = new SkillNotification();
        res.setSkill(root.skill);
        res.setNewName(root.newName);
        res.setId(root.id);
        res.setProfile(fromInitials(root.initials));
        res.setAdminNotificationStatus(AdminNotificationStatus.ALIVE);
        res.setReason(root.reason);
        res.setTimeOfOccurrence(root.occurrence);
        return res;
    }

    @Override
    public AdminNotification deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JsonProcessingException {
        AdminNotification res = null;
        Root root = jsonParser.readValueAs(Root.class);
        if (root != null) {
            if (root.type.equals(new ProfileEntryNotification().getNotificationType())) {
                res = deserializeAsProfileEntryNotification(root);
            } else if (root.type.equals(new ProjectNotification().getNotificationType())) {
                res = deserializeAsProjectNotification(root);
            } else if (root.type.equals(new ProfileUpdatedNotification().getNotificationType())) {
                res = deserializeAsProfileUpdatedNotification(root);
            } else if (root.type.equals(new SkillNotification().getNotificationType())) {
                res = deserializeAsSkillNotification(root);
            }
        }
        return res;
    }

    private static class Root {
        public Long id;
        public String initials;
        public LocalDateTime occurrence;
        public AdminNotificationReason reason;
        public String type;
        public NameEntity nameEntity;
        public Long profileEntryId;
        public Long projectId;
        public String newName;
        public Skill skill;
    }
}
