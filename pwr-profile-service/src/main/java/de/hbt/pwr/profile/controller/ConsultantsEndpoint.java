package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.ConsultantInfoDTO;
import de.hbt.pwr.profile.service.ConsultantService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

/**
 * REST Endpoint for CRUD operations on consultants.
 * <p>
 * Created by cg on 07.04.2017.
 */
@RestController
@RequestMapping("/consultants")
@Api(value = "Consultants resource", produces = "application/json")
public class ConsultantsEndpoint {

    private final ConsultantRepository consultantRepository;
    private final ConsultantService consultantService;


    @Autowired
    public ConsultantsEndpoint(ConsultantRepository consultantRepository, ConsultantService consultantService) {
        this.consultantService = consultantService;
        this.consultantRepository = consultantRepository;
    }

    @GetMapping
    @ApiOperation(value = "Get a list of all consultants", response = List.class)
    @ApiResponse(code = 200, message = "found 0 or more consultants")
    public List<Consultant> listAll() {
        return consultantRepository.findAll();
    }

    @GetMapping("{initials}")
    @ApiOperation(value = "Find a consultant by his initials")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Found"),
            @ApiResponse(code = 404, message = "No consultant with that initials found"),
            @ApiResponse(code = 423, message = "Consultant exists but is inactive")})
    public ResponseEntity<Consultant> findByInitials(@PathVariable("initials") String initials) {
        Optional<Consultant> consultant = consultantRepository.findByInitials(initials);
        if (consultant.isPresent()) {
            Consultant res = consultant.get();
            if (res.getActive()) {
                return ResponseEntity.ok(res);
            } else {
                return ResponseEntity.status(423).build();
            }

        } else {
            throw new WebApplicationException(NOT_FOUND, "No consultant found with initials: " + initials);
        }
    }


    @PostMapping
    @ApiOperation(value = "Creates a new action for the consultant. Possible actions: 'new'")
    @ApiResponses(value = {
            @ApiResponse(code = 201, message = "Created."),
            @ApiResponse(code = 409, message = "Conflict! A consultant with that initials allready exists.")})
    public ResponseEntity<Consultant> create(@RequestBody Consultant consultant, @RequestParam("action") String action) {
        Consultant res;
        if ("new".equals(action)) {
            res = consultantService.createNewConsultant(consultant.getInitials(), consultant.getFirstName(),
                    consultant.getLastName(), consultant.getTitle(), consultant.getProfilePictureId(), consultant.getBirthDate());
        } else {
            throw new WebApplicationException(HttpStatus.BAD_REQUEST, "Invalid request: Unknown action type " + action);
        }
        return ResponseEntity.ok(res);
    }

    @PatchMapping("{initials}")
    @ApiOperation(value = "Update a consultant")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Updated. Updated resource in response.", response = Consultant.class),
            @ApiResponse(code = 404, message = "No consultant found to update at the given URI."),
            @ApiResponse(code = 423, message = "Consultant exists but is inactive")
    })
    public ResponseEntity<Consultant> update(@RequestBody Consultant consultant, @PathVariable("initials") String initials) {
        Consultant result = consultantService.updatePersonalData(initials, consultant);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("{initials}/delete")
    @ApiOperation(value = "Deletes a Consultant")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Deleted.", response = boolean.class),
            @ApiResponse(code = 404, message = "No consultant found to delete at the given URI."),
            @ApiResponse(code = 423, message = "Consultant exists but is active")
    })
    public ResponseEntity<Void> delete(@PathVariable("initials") String initials) {
        consultantService.deleteConsultant(initials);
        return ResponseEntity.ok().build();
    }


    @GetMapping("info")
    public ResponseEntity<List<ConsultantInfoDTO>> getAllConsultantInfos() {
        List<ConsultantInfoDTO> response = consultantRepository.findAll()
                .stream()
                .filter(consultant -> BooleanUtils.isTrue(consultant.getActive()))
                .map(consultant -> new ConsultantInfoDTO(consultant.getFirstName() + " " + consultant.getLastName(), consultant.getInitials()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
