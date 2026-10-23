package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.ConsultantDTO;
import de.hbt.pwr.profile.model.ConsultantNameDTO;
import de.hbt.pwr.profile.service.ConsultantShortNames;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.NOT_FOUND;

/**
 * What every user may read about consultants: one consultant by the initials and the names of all (#216). Listing and
 * managing them is for admins ({@link ConsultantAdminEndpoint}, #218).
 * <p>
 * Created by cg on 07.04.2017.
 */
@RestController
@RequestMapping("/consultants")
@Api(value = "Consultants resource", produces = "application/json")
public class ConsultantsEndpoint {

    private final ConsultantRepository consultantRepository;

    @Autowired
    public ConsultantsEndpoint(ConsultantRepository consultantRepository) {
        this.consultantRepository = consultantRepository;
    }

    @GetMapping("{initials}")
    @ApiOperation(value = "Find a consultant by his initials")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Found"),
            @ApiResponse(code = 404, message = "No consultant with that initials found"),
            @ApiResponse(code = 423, message = "Consultant exists but is inactive")})
    public ResponseEntity<ConsultantDTO> findByInitials(@PathVariable("initials") String initials) {
        Optional<Consultant> consultant = consultantRepository.findByInitials(initials);
        if (consultant.isPresent()) {
            Consultant res = consultant.get();
            if (res.getActive()) {
                ConsultantDTO dto = new ConsultantDTO()
                        .toBuilder()
                        .active(res.getActive())
                        .birthDate(res.getBirthDate())
                        .title(res.getTitle())
                        .firstName(res.getFirstName())
                        .lastName(res.getLastName())
                        .profileId(res.getProfile().getId())
                        .profilePictureId(res.getProfilePictureId())
                        .initials(res.getInitials())
                        .profileLastUpdated(res.getProfile().getLastEdited())
                        .build();
                return ResponseEntity.ok(dto);
            } else {
                return ResponseEntity.status(423).build();
            }

        } else {
            throw new WebApplicationException(NOT_FOUND, "No consultant found with initials: " + initials);
        }
    }

    /**
     * Short and full names of all consultants (#216), for every user: the webclient names colleagues by their short
     * name. Nothing else about the consultants.
     */
    @GetMapping("names")
    public List<ConsultantNameDTO> getAllConsultantNames() {
        return ConsultantShortNames.of(consultantRepository.findAll());
    }
}
