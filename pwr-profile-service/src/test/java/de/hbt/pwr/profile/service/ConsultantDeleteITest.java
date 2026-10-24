package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.AbstractIntegrationTest;
import de.hbt.pwr.profile.data.AdminNotificationRepository;
import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.data.ProfilePictureRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.ProfilePicture;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.notification.AdminNotificationReason;
import de.hbt.pwr.profile.model.notification.ProfileEntryNotification;
import de.hbt.pwr.profile.model.notification.ProjectNotification;
import de.hbt.pwr.profile.model.notification.SkillNotification;
import de.hbt.pwr.profile.model.profile.LanguageSkillLevel;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.*;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.client.ResourceAccessException;

import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Deleting a consultant deletes everything about the consultant, in the other services too (#240)
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class ConsultantDeleteITest extends AbstractIntegrationTest {

    @Autowired
    private ConsultantService consultantService;
    @Autowired
    private ConsultantRepository consultantRepository;
    @Autowired
    private ProfilePictureRepository profilePictureRepository;
    @Autowired
    private ProfileEntryService profileEntryService;
    @Autowired
    private AdminNotificationRepository adminNotificationRepository;
    @Autowired
    private EntityManager entityManager;

    private ProfilePicture picture;

    @Before
    public void setUp() {
        ProfilePicture newPicture = new ProfilePicture();
        newPicture.setImage(new byte[]{1, 2, 3});
        newPicture.setContentType("image/png");
        picture = profilePictureRepository.saveAndFlush(newPicture);
        Consultant consultant = consultantService.createNewConsultant("old", "Olga", "Alt", null, picture.getId(),
                LocalDate.of(1990, 1, 1));
        consultant.setActive(false);
        consultantRepository.saveAndFlush(consultant);
        when(viewProfileClient.getAllViewProfiles("old")).thenReturn(List.of("v1", "v2"));
    }

    @Test
    public void deletesTheViewProfilesTheDocumentsAndThePicture_andRefreshesTheStatistics() {
        consultantService.deleteConsultant("old");

        verify(viewProfileClient).deleteViewProfile("old", "v1");
        verify(viewProfileClient).deleteViewProfile("old", "v2");
        verify(reportClient).deleteAllReports("old");
        verify(statisticsClient).refreshConsultantsAfterCommit();
        assertThat(consultantRepository.findByInitials("old")).isEmpty();
        assertThat(profilePictureRepository.findById(picture.getId())).isEmpty();
    }

    private static NameEntity named(String name, NameEntityType type) {
        return NameEntity.builder().name(name).type(type).build();
    }

    /**
     * A full profile, written to the database: entries of every kind, projects with client, roles and skills, skills,
     * notifications of every kind. Only flushing shows whether a row still points to a deleted one.
     */
    @Test
    public void aFullProfile_isDeletedInTheDatabase() {
        Consultant consultant = consultantRepository.findByInitials("old").orElseThrow();
        Profile profile = consultant.getProfile();
        SectorEntry sector = profileEntryService.updateProfileEntry(new SectorEntry(named("Banken", NameEntityType.SECTOR)), profile, NameEntityType.SECTOR);
        profileEntryService.updateProfileEntry(new LanguageSkill(named("Deutsch", NameEntityType.LANGUAGE), LanguageSkillLevel.BUSINESS_FLUENT), profile, NameEntityType.LANGUAGE);
        profileEntryService.updateProfileEntry(new CareerEntry(named("HBT", NameEntityType.CAREER), LocalDate.of(2020, 1, 1), null), profile, NameEntityType.CAREER);
        profileEntryService.updateProfileEntry(new EducationEntry(named("Uni", NameEntityType.EDUCATION), "Master"), profile, NameEntityType.EDUCATION);
        profileEntryService.updateProfileEntry(new QualificationEntry(named("ISTQB", NameEntityType.QUALIFICATION), LocalDate.of(2022, 1, 1)), profile, NameEntityType.QUALIFICATION);
        profileEntryService.updateProfileEntry(new TrainingEntry(named("Kurs", NameEntityType.TRAINING), LocalDate.of(2021, 1, 1), null), profile, NameEntityType.TRAINING);
        profileEntryService.updateProfileEntry(new SpecialFieldEntry(named("Testen", NameEntityType.SPECIAL_FIELD)), profile, NameEntityType.SPECIAL_FIELD);
        Skill kotlin = profileEntryService.updateProfileSkills(Skill.builder().name("Kotlin").rating(3).versions(new HashSet<>()).build(), profile);
        Set<Skill> projectSkills = new HashSet<>(Set.of(Skill.builder().name("Java").rating(4).versions(new HashSet<>()).build()));
        Project project = profileEntryService.updateProject(Project.builder().name("Portal")
                .client(named("Kunde AG", NameEntityType.COMPANY)).broker(named("Vermittler", NameEntityType.COMPANY))
                .projectRoles(new HashSet<>(Set.of(named("Entwickler", NameEntityType.PROJECT_ROLE))))
                .skills(projectSkills).build(), profile);
        adminNotificationRepository.save(new ProfileEntryNotification(profile, sector.getId(), sector.getNameEntity()));
        adminNotificationRepository.save(new SkillNotification(profile, AdminNotificationReason.DANGEROUS_SKILL_ADDED_UNKNOWN, kotlin));
        adminNotificationRepository.save(new ProjectNotification(profile, project, project.getClient()));
        entityManager.flush();
        entityManager.clear();

        consultantService.deleteConsultant("old");
        entityManager.flush();
        entityManager.clear();

        assertThat(consultantRepository.findByInitials("old")).isEmpty();
        assertThat(entityManager.find(Profile.class, profile.getId())).isNull();
        assertThat(notificationsOf(profile)).isZero();
        assertThat(entityManager.find(Skill.class, kotlin.getId())).isNull();
        assertThat(entityManager.find(Project.class, project.getId())).isNull();
        assertThat(entityManager.find(SectorEntry.class, sector.getId())).isNull();
        assertThat(profilePictureRepository.findById(picture.getId())).isEmpty();
    }

    private long notificationsOf(Profile profile) {
        return entityManager.createQuery("select count(n) from AdminNotification n where n.profile.id = :id", Long.class)
                .setParameter("id", profile.getId()).getSingleResult();
    }

    private Project project(Profile profile, String name, String skill) {
        Set<Skill> projectSkills = new HashSet<>(Set.of(Skill.builder().name(skill).rating(4).versions(new HashSet<>()).build()));
        Project project = profileEntryService.updateProject(Project.builder().name(name)
                .projectRoles(new HashSet<>()).skills(projectSkills).build(), profile);
        entityManager.flush();
        return project;
    }

    /**
     * Until #243 a deleted project kept its row and its links to the skills, which are those of the profile; that
     * broke deleting the consultant (project_skills)
     */
    @Test
    public void aProfileWithAProjectDeletedTheOldWay_isDeletedInTheDatabase() {
        Profile profile = consultantRepository.findByInitials("old").orElseThrow().getProfile();
        Project project = project(profile, "Altprojekt", "Java");
        adminNotificationRepository.save(new ProjectNotification(profile, project, null));
        // The old way: out of the profile, the row stays
        profile.getProjects().remove(project);
        entityManager.flush();
        entityManager.clear();

        consultantService.deleteConsultant("old");
        entityManager.flush();
        entityManager.clear();

        assertThat(consultantRepository.findByInitials("old")).isEmpty();
        assertThat(entityManager.find(Project.class, project.getId())).isNull();
        assertThat(notificationsOf(profile)).isZero();
    }

    @Test
    public void deletingAProject_deletesItsRowAndItsNotifications_theSkillsStayInTheProfile() {
        Profile profile = consultantRepository.findByInitials("old").orElseThrow().getProfile();
        Project project = project(profile, "Altprojekt", "Java");
        adminNotificationRepository.save(new ProjectNotification(profile, project, null));
        entityManager.flush();

        profileEntryService.deleteProject(project.getId(), profile);
        entityManager.flush();
        entityManager.clear();

        assertThat(entityManager.find(Project.class, project.getId())).isNull();
        assertThat(entityManager.createQuery("select count(n) from ProjectNotification n where n.project.id = :id", Long.class)
                .setParameter("id", project.getId()).getSingleResult()).isZero();
        assertThat(entityManager.find(Profile.class, profile.getId()).getSkills()).extracting(Skill::getName).containsExactly("Java");
    }

    @Test
    public void ifTheReportServiceFails_theConsultantStays() {
        doThrow(new ResourceAccessException("Connection refused")).when(reportClient).deleteAllReports(anyString());

        WebApplicationException error = catchThrowableOfType(() -> consultantService.deleteConsultant("old"),
                WebApplicationException.class);

        assertThat(error.getStatus()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(consultantRepository.findByInitials("old")).isPresent();
        assertThat(profilePictureRepository.findById(picture.getId())).isPresent();
        verify(statisticsClient, never()).refreshConsultantsAfterCommit();
    }

    @Test
    public void ifTheViewProfileServiceFails_noDocumentIsDeleted_andTheConsultantStays() {
        doThrow(new ResourceAccessException("Connection refused")).when(viewProfileClient).deleteViewProfile("old", "v2");

        WebApplicationException error = catchThrowableOfType(() -> consultantService.deleteConsultant("old"),
                WebApplicationException.class);

        assertThat(error.getStatus()).isEqualTo(HttpStatus.BAD_GATEWAY);
        verify(reportClient, never()).deleteAllReports(anyString());
        assertThat(consultantRepository.findByInitials("old")).isPresent();
    }

    @Test
    public void anActiveConsultant_isNotDeleted() {
        consultantService.createNewConsultant("act", "Aktiv", "Aktiv", null, null, LocalDate.of(1990, 1, 1));

        WebApplicationException error = catchThrowableOfType(() -> consultantService.deleteConsultant("act"),
                WebApplicationException.class);

        assertThat(error.getStatus()).isEqualTo(HttpStatus.LOCKED);
        verifyNoInteractions(reportClient);
    }
}
