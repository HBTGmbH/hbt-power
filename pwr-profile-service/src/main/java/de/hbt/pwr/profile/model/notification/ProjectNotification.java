package de.hbt.pwr.profile.model.notification;

import com.fasterxml.jackson.core.JsonGenerator;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.Project;
import de.hbt.pwr.profile.service.AdminNotificationService;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import java.io.IOException;
import java.time.LocalDateTime;

@Entity
public class ProjectNotification extends AdminNotification {
    @ManyToOne
    private Project project;
    @ManyToOne
    private NameEntity nameEntity;

    public ProjectNotification(Profile profile, Project project, NameEntity nameEntity) {
        super(profile, AdminNotificationReason.NAME_ENTITY_ADDED, AdminNotificationStatus.ALIVE, LocalDateTime.now());
        this.project = project;
        this.nameEntity = nameEntity;
    }

    public ProjectNotification(Project project) {
        this.project = project;
    }

    public ProjectNotification() {
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    @Override
    public String getNotificationType() {
        return this.getClass().getSimpleName();
    }

    @Override
    public void addCustomJSON(JsonGenerator generator) throws IOException {
        super.addCustomJSON(generator);
        generator.writeNumberField("projectId", project.getId());
        generator.writeObjectField("nameEntity", nameEntity);
    }

    @Override
    public void executeOKAction(AdminNotificationService service) {

    }

    @Override
    public void executeDeleteAction(AdminNotificationService service) {

    }

    @Override
    public void executeEditAction(AdminNotificationService service) {

    }
}
