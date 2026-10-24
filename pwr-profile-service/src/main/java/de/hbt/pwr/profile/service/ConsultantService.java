package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.client.ReportClient;
import de.hbt.pwr.profile.client.StatisticsClient;
import de.hbt.pwr.profile.client.ViewProfileClient;
import de.hbt.pwr.profile.data.AdminNotificationRepository;
import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.data.ProjectRepository;
import de.hbt.pwr.profile.data.SkillRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.Project;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static java.util.Optional.ofNullable;
import static org.apache.commons.lang3.BooleanUtils.isFalse;
import static org.springframework.http.HttpStatus.LOCKED;
import static org.springframework.http.HttpStatus.NOT_FOUND;

/**
 * Provides business level methods to maintain the {@link Consultant} resource.
 */
@Slf4j
@Service
public class ConsultantService {
    private final ConsultantRepository consultantRepository;
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final ViewProfileClient viewProfileClient;
    private final AdminNotificationRepository adminNotificationRepository;
    private final ReportClient reportClient;
    private final PictureService pictureService;
    private final StatisticsClient statisticsClient;

    @Autowired
    public ConsultantService(ConsultantRepository consultantRepository,
                             SkillRepository skillRepository,
                             ProjectRepository projectRepository, ViewProfileClient viewProfileClient,
                             AdminNotificationRepository adminNotificationRepository, ReportClient reportClient,
                             PictureService pictureService, StatisticsClient statisticsClient) {
        this.consultantRepository = consultantRepository;
        this.skillRepository = skillRepository;
        this.projectRepository = projectRepository;
        this.viewProfileClient = viewProfileClient;
        this.adminNotificationRepository = adminNotificationRepository;
        this.reportClient = reportClient;
        this.pictureService = pictureService;
        this.statisticsClient = statisticsClient;
    }

    /**
     * Persistently updates the personal data of a {@link Consultant}
     * <p>
     * Personal data refers to all values that represent personal information, and include
     * {@link Consultant#birthDate}, {@link Consultant#firstName}, {@link Consultant#lastName},
     * {@link Consultant#initials}, {@link Consultant#title}
     * </p>
     * <p>
     * The update mechanism uses the <code>updateFrom</code> to retrieve the correct values.
     * Values will only be overwritten when their fields in <code>updateFrom</code> are not null.
     * </p>
     *
     * @param initials   is the consultant that is being partially updated
     * @param updateFrom encapsulates the data that is used for the update
     * @return the initial <code>toUpdate</code> {@link Consultant}
     */
    @Transactional
    public Consultant updatePersonalData(String initials, Consultant updateFrom) {
        Consultant toUpdate = consultantRepository.findByInitials(initials)
                .orElseThrow(() -> new WebApplicationException(NOT_FOUND, "No consultant found with initials: " + initials));
        if (!toUpdate.getActive()) {
            if (!updateFrom.getActive()) {
                throw new WebApplicationException(LOCKED, "Consultant " + initials + " is not active!");
            }
        }

        if (updateFrom.getBirthDate() != null) {
            toUpdate.setBirthDate(updateFrom.getBirthDate());
        }
        if (updateFrom.getFirstName() != null) {
            toUpdate.setFirstName(updateFrom.getFirstName());
        }
        if (updateFrom.getLastName() != null) {
            toUpdate.setLastName(updateFrom.getLastName());
        }
        if (updateFrom.getInitials() != null) {
            toUpdate.setInitials(updateFrom.getInitials());
        }
        if (updateFrom.getTitle() != null) {
            toUpdate.setTitle(updateFrom.getTitle());
        }
        if (updateFrom.getActive() != null) {
            toUpdate.setActive(updateFrom.getActive());
        }
        if (updateFrom.getProfilePictureId() != null) {
            toUpdate.setProfilePictureId(updateFrom.getProfilePictureId());
        }
        return toUpdate;
    }

    @Transactional
    public Consultant createNewConsultant(String initials, String firstName, String lastName, String title, String profilePictureId, LocalDate birthDate) {
        if (consultantRepository.existsByInitials(initials)) {
            throw new WebApplicationException(HttpStatus.BAD_REQUEST, "Consultant with initials = " + initials + " already exists");
        }
        Consultant res = new Consultant();
        res.setActive(true);
        res.setFirstName(firstName);
        res.setLastName(lastName);
        res.setInitials(initials);
        res.setTitle(title);
        res.setProfile(Profile.empty());
        res.setBirthDate(birthDate);
        res.setProfilePictureId(profilePictureId);
        res.setId(null);
        return consultantRepository.save(res);
    }

    /**
     * Deletes an inactive consultant with everything about the consultant (#240): first the view profiles and the
     * exported documents in the other services, then the notifications, the profile, the picture and the consultant.
     * If another service fails, the consultant stays; deleting again deletes the rest. The statistics load their copy
     * again after the commit. Profile elements and skills of the skill tree the consultant used stay.
     */
    @Transactional
    public void deleteConsultant(String initials) {

        Consultant toDelete = consultantRepository.findByInitials(initials)
                .orElseThrow(() -> new WebApplicationException(NOT_FOUND, "No consultant with initials '" + initials + "' found."));
        if (toDelete.getActive()) {
            throw new WebApplicationException(HttpStatus.LOCKED, "Only Inactive Consultants can be deleted!");
        } else {

            deleteInOtherServices(toDelete.getInitials());

            adminNotificationRepository.deleteAdminNotificationsByProfileId(toDelete.getProfile().getId());

            deleteProjectsAndSkills(toDelete.getProfile());
            String pictureId = toDelete.getProfilePictureId();
            consultantRepository.delete(toDelete);
            if (pictureId != null) {
                pictureService.deletePicture(pictureId);
            }
            statisticsClient.refreshConsultantsAfterCommit();
        }
    }

    /**
     * The skills of the projects are those of the profile. Until #243 a deleted project kept its row and its links to
     * them; such projects go with the consultant, or deleting the skills breaks the links (project_skills). A skill
     * a project of another profile holds, which old data has, stays.
     */
    private void deleteProjectsAndSkills(Profile profile) {
        Set<Skill> skills = new HashSet<>(profile.getSkills());
        profile.getProjects().forEach(project -> skills.addAll(project.getSkills()));
        if (!skills.isEmpty()) {
            List<Project> deletedProjects = projectRepository.findAllWithoutProfileHoldingAnyOf(skills);
            if (!deletedProjects.isEmpty()) {
                log.info("Deleting " + deletedProjects.size() + " projects of " + profile.getId() + " deleted before");
                deleteProjects(deletedProjects);
            }
            List<Skill> elsewhere = projectRepository.findSkillsInProjectsOfOtherProfiles(skills, profile);
            if (!elsewhere.isEmpty()) {
                log.warn("Keeping skills a project of another profile holds: " + elsewhere);
                skills.removeAll(elsewhere);
            }
        }
        deleteProjects(new ArrayList<>(profile.getProjects()));
        profile.getProjects().clear();
        profile.getSkills().clear();
        skills.forEach(skillRepository::delete);
    }

    private void deleteProjects(List<Project> projects) {
        if (projects.isEmpty()) {
            // MariaDB rejects "in ()"
            return;
        }
        adminNotificationRepository.deleteAll(adminNotificationRepository.findProjectNotificationsAbout(projects));
        projects.forEach(project -> {
            project.getSkills().clear();
            projectRepository.delete(project);
        });
    }

    private void deleteInOtherServices(String initials) {
        try {
            List<String> viewIds = viewProfileClient.getAllViewProfiles(initials);
            if (viewIds != null) {
                viewIds.forEach(id -> viewProfileClient.deleteViewProfile(initials, id));
            }
            reportClient.deleteAllReports(initials);
        } catch (RestClientException e) {
            throw new WebApplicationException(HttpStatus.BAD_GATEWAY, "The view profiles or documents of " + initials
                    + " could not be deleted, the consultant stays: " + e.getMessage());
        }
    }

    private Profile toProfile(Consultant consultant) {
        return ofNullable(consultant.getProfile())
                .orElseThrow(() -> new WebApplicationException(NOT_FOUND, "No profile for consultant '" + consultant.getInitials() + "' found."));
    }

    private Consultant validateActive(Consultant consultant) {
        if (isFalse(consultant.getActive())) {
            throw new WebApplicationException(LOCKED, "Consultant " + consultant.getInitials() + " is not active!");
        }
        return consultant;
    }

    public Profile getProfileByInitials(String initials) {
        return consultantRepository.findByInitials(initials)
                .map(this::validateActive)
                .map(this::toProfile)
                .orElseThrow(() -> new WebApplicationException(NOT_FOUND, "No consultant with initials '" + initials + "' found."));
    }
}
