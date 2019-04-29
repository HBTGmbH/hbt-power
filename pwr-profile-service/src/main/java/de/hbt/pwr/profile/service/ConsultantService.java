package de.hbt.pwr.profile.service;

import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.profile.Profile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDate;

import static java.util.Optional.ofNullable;
import static org.apache.commons.lang3.BooleanUtils.isFalse;
import static org.springframework.http.HttpStatus.LOCKED;
import static org.springframework.http.HttpStatus.NOT_FOUND;

/**
 * Provides business level methods to maintain the {@link Consultant} resource.
 */
@Service
public class ConsultantService {
    private final ConsultantRepository consultantRepository;

    @Autowired
    public ConsultantService(ConsultantRepository consultantRepository) {
        this.consultantRepository = consultantRepository;
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
            throw new WebApplicationException(LOCKED, "Consultant " + initials + " is not active!");
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
    public boolean deleteConsultant(String initials){
        if (!consultantRepository.existsByInitials(initials)) {
            throw new WebApplicationException(HttpStatus.NOT_FOUND, "Consultant with initials = " + initials + " was not found!");
        }
        Consultant toDelete = consultantRepository.findByInitials(initials)
                .orElseThrow(() -> new WebApplicationException(NOT_FOUND, "No profile for consultant '" + initials + "' found."));
        if (toDelete.getActive()){
            throw new WebApplicationException(HttpStatus.LOCKED, "Only Inactive Consultants can be deleted!");
        }else{
            consultantRepository.delete(toDelete);
            // TODO überlegen ob löschen das richtige ist, sonst unkenntlich machen(Daten von Namen trennen)
        }
        return true;
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
                .orElseThrow(() -> new WebApplicationException(NOT_FOUND, "No consultant with initials '" + initials + "'found."));
    }
}
