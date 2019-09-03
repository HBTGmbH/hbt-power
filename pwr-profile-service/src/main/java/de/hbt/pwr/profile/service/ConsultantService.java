package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.client.ViewProfileClient;
import de.hbt.pwr.profile.data.AdminNotificationRepository;
import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.data.ProjectRepository;
import de.hbt.pwr.profile.data.SkillRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.Profile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;

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

    @Autowired
    public ConsultantService(ConsultantRepository consultantRepository,
                             SkillRepository skillRepository,
                             ProjectRepository projectRepository, ViewProfileClient viewProfileClient,
                             AdminNotificationRepository adminNotificationRepository) {
        this.consultantRepository = consultantRepository;
        this.skillRepository = skillRepository;
        this.projectRepository = projectRepository;
        this.viewProfileClient = viewProfileClient;
        this.adminNotificationRepository = adminNotificationRepository;
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
        return toUpdate;
    }

    @Transactional
    public Consultant createNewConsultant(String initials, String firstName, String lastName, String title, LocalDate birthDate) {
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
        res.setId(null);
        return consultantRepository.save(res);
    }

    @Transactional
    public void deleteConsultant(String initials) {

        Consultant toDelete = consultantRepository.findByInitials(initials)
                .orElseThrow(() -> new WebApplicationException(NOT_FOUND, "No consultant with initials '" + initials + "' found."));
        if (toDelete.getActive()) {
            throw new WebApplicationException(HttpStatus.LOCKED, "Only Inactive Consultants can be deleted!");
        } else {
            //TODO im View Profile Service auch die Delete Logik anpassen
            // TODO zum Löschen eines Beraters müssen alle einträge seiner Id in Tabellen gelöscht sein
            // View Profile Service bescheid sagen

            ResponseEntity<List<String>> response = viewProfileClient.getAllViewProfiles(toDelete.getInitials());
            log.debug("Response: " + response.toString());
            List<String> viewIds = response.getBody();
            if (viewIds != null) {
                log.debug("ViewIds for " + initials + ":  " + viewIds.toString());
                viewIds.forEach((id) -> viewProfileClient.deleteViewProfile(toDelete.getInitials(), id));
            }


            adminNotificationRepository.deleteAdminNotificationsByProfileId(toDelete.getProfile().getId());

            Stream<Skill> profileSkills = toDelete.getProfile().getSkills().stream();
            Stream<Skill> projectSkills = toDelete.getProfile().getProjects().stream().flatMap(project -> project.getSkills().stream());
            //Set<Skill> skillSet = Stream.of(profileSkills, projectSkills).flatMap(Function.identity()).collect(Collectors.toSet());

            toDelete.getProfile().getProjects().forEach(project -> project.getSkills().clear());
            consultantRepository.flush();
            projectSkills.forEach(skillRepository::delete);
            consultantRepository.flush();
            profileSkills.forEach(skillRepository::delete);
            consultantRepository.flush();
            //toDelete.getProfile().getProjects().forEach(project -> log.debug("Projects after clearing id: " + project.getId() + "    |  " + project.getSkills().toString()));

            toDelete.getProfile().getSkills().clear();
            consultantRepository.flush();

            toDelete.getProfile().getProjects().forEach(projectRepository::delete);
            consultantRepository.flush();

            //skillSet.forEach(skillRepository::delete);
            consultantRepository.flush();

            consultantRepository.delete(toDelete);
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
