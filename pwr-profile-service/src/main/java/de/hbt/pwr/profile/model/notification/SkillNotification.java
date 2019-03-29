package de.hbt.pwr.profile.model.notification;

import com.fasterxml.jackson.core.JsonGenerator;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.service.AdminNotificationService;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.io.IOException;
import java.time.LocalDateTime;

@Entity
public class SkillNotification extends AdminNotification {

    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;

    private String newName;

    public SkillNotification(Profile profile, AdminNotificationReason reason, Skill skill) {
        super(profile, reason, AdminNotificationStatus.ALIVE, LocalDateTime.now());
        this.skill = skill;
        this.newName = skill.getName();
    }


    public SkillNotification(Skill skill) {
        this.skill = skill;
        this.newName = skill.getName();
    }

    public SkillNotification() {

    }


    public Skill getSkill() {
        return skill;
    }


    public void setSkill(Skill skill) {
        this.skill = skill;
    }


    public String getNewName() {
        return newName;
    }


    public void setNewName(String newName) {
        this.newName = newName;
    }


    @Override
    public void addCustomJSON(JsonGenerator generator) throws IOException {
        super.addCustomJSON(generator);
        generator.writeObjectField("skill", skill);
        generator.writeStringField("newName", newName);
    }


    @Override
    public String getNotificationType() {
        return this.getClass().getSimpleName();
    }

    @Override
    public void executeOKAction(AdminNotificationService service) {
        service.deleteNotification(this);
    }

    @Override
    public void executeDeleteAction(AdminNotificationService service) {
        service.executeSkillNotificationDelete(this);
    }

    @Override
    public void executeEditAction(AdminNotificationService service) {
        service.executeSkillNotificationEdit(this);
    }


    @Override
    public String toString() {
        return "SkillNotification{" +
                "skill=" + skill +
                ", newName='" + newName + '\'' +
                ", id=" + id +
                ", reason=" + reason +
                ", adminNotificationStatus=" + adminNotificationStatus +
                ", timeOfOccurrence=" + timeOfOccurrence +
                '}';
    }
}
