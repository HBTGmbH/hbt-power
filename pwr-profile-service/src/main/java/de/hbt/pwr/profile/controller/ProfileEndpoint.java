package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.service.ConsultantService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/profiles")
@Api(value = "Profile-Resource", produces = "application/json")
public class ProfileEndpoint {

    private final ConsultantService consultantService;

    @Autowired
    public ProfileEndpoint(ConsultantService consultantService) {
        this.consultantService = consultantService;
    }

    @GetMapping("{initials}")
    @ApiOperation(value = "Returns a profile ", response = Profile.class)
    @ApiResponse(code = 200, message = "Profile returned in body")
    public ResponseEntity getSingleProfile(@PathVariable("initials") String initials) {
        return ResponseEntity.ok(consultantService.getProfileByInitials(initials));
    }
}
