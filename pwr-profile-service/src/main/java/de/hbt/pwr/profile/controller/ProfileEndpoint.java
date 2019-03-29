package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.errors.WebApplicationException;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.service.ConsultantService;
import de.hbt.pwr.profile.service.ProfileUpdateService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;


@RestController
@RequestMapping(value = "/profiles")
@Api(value = "Profile-Resource", produces = "application/json")
public class ProfileEndpoint {

    private final ConsultantService consultantService;
    private final ProfileUpdateService profileUpdateService;


    @Autowired
    public ProfileEndpoint(ConsultantService consultantService, ProfileUpdateService profileUpdateService) {
        this.consultantService = consultantService;
        this.profileUpdateService = profileUpdateService;
    }

    @GetMapping("{initials}")
    @ApiOperation(value = "Returns a profile ", response = Profile.class)
    @ApiResponse(code = 200, message = "Profile returned in body")
    public ResponseEntity getSingleProfile(@PathVariable("initials") String initials) {
        return ResponseEntity.ok(consultantService.getProfileByInitials(initials));
    }

    @PutMapping("{initials}")
    @ApiOperation(value = "Updates a profile and resolved possible conflicts with the database", response = Profile.class)
    @ApiResponse(code = 200, message = "Profile successfully persisted")
    public ResponseEntity<Map<String, Object>> updateSingleProfile(@RequestBody Profile profile, @PathVariable("initials") String initials) {
        if (profile == null) {
            throw new WebApplicationException(NOT_FOUND, "No profile for consultant '" + initials + "' found.");
        }
        if (profile.getId() == null) {
            throw new WebApplicationException(BAD_REQUEST, "ID of profile was null.");
        }
        Profile existingProfile = consultantService.getProfileByInitials(initials);
        if (!existingProfile.getId().equals(profile.getId())) {
            throw new WebApplicationException(BAD_REQUEST, "The profile present in the request body(id=" + profile.getId() + ") does not match" +
                    "the profile existing for " + initials);
        }
        profile = profileUpdateService.updateProfile(profile);
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("profile", profile);
        return ResponseEntity.ok(responseMap);
    }
}
