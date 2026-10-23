package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.ConsultantInfoDTO;
import de.hbt.pwr.profile.service.ConsultantService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Listing and managing the consultants (#218): under /admin, which the edge service restricts to admins. The
 * statistics service loads its copy of the consultants from here too.
 */
@RestController
@RequestMapping("/admin/consultants")
@Api(value = "Consultants resource for admins", produces = "application/json")
public class ConsultantAdminEndpoint {

    private final ConsultantRepository consultantRepository;
    private final ConsultantService consultantService;

    @Autowired
    public ConsultantAdminEndpoint(ConsultantRepository consultantRepository, ConsultantService consultantService) {
        this.consultantRepository = consultantRepository;
        this.consultantService = consultantService;
    }

    @GetMapping
    @ApiOperation(value = "Get a list of all consultants", response = List.class)
    @ApiResponse(code = 200, message = "found 0 or more consultants")
    public List<Consultant> listAll() {
        return consultantRepository.findAll();
    }

    /**
     * Name and initials of the active consultants, for the consultant selection
     */
    @GetMapping("info")
    public List<ConsultantInfoDTO> getAllConsultantInfos() {
        return consultantRepository.findAll()
                .stream()
                .filter(consultant -> BooleanUtils.isTrue(consultant.getActive()))
                .map(consultant -> new ConsultantInfoDTO(consultant.getFirstName() + " " + consultant.getLastName(), consultant.getInitials()))
                .collect(Collectors.toList());
    }

    @PostMapping
    @ApiOperation(value = "Creates a new consultant")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Created."),
            @ApiResponse(code = 409, message = "Conflict! A consultant with that initials allready exists.")})
    public ResponseEntity<Consultant> create(@RequestBody Consultant consultant) {
        return ResponseEntity.ok(consultantService.createNewConsultant(consultant.getInitials(), consultant.getFirstName(),
                consultant.getLastName(), consultant.getTitle(), consultant.getProfilePictureId(), consultant.getBirthDate()));
    }

    @PatchMapping("{initials}")
    @ApiOperation(value = "Update a consultant")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Updated. Updated resource in response.", response = Consultant.class),
            @ApiResponse(code = 404, message = "No consultant found to update at the given URI."),
            @ApiResponse(code = 423, message = "Consultant exists but is inactive")
    })
    public ResponseEntity<Consultant> update(@RequestBody Consultant consultant, @PathVariable("initials") String initials) {
        return ResponseEntity.ok(consultantService.updatePersonalData(initials, consultant));
    }

    @DeleteMapping("{initials}")
    @ApiOperation(value = "Deletes a Consultant")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Deleted."),
            @ApiResponse(code = 404, message = "No consultant found to delete at the given URI."),
            @ApiResponse(code = 423, message = "Consultant exists but is active")
    })
    public ResponseEntity<Void> delete(@PathVariable("initials") String initials) {
        consultantService.deleteConsultant(initials);
        return ResponseEntity.ok().build();
    }
}
