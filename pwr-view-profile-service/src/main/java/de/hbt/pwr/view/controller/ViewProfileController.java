package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.exception.ServiceError;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.service.ViewProfileImporter;
import de.hbt.pwr.view.service.ViewProfileService;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(value = "/view", description = "Provides means to manage view profiles with basic CRUD operations on a per user base.")
@RequestMapping("/view")
@Controller
public class ViewProfileController {

    private final ViewProfileImporter viewProfileImporter;

    private final ViewProfileService viewProfileService;

    @Autowired
    public ViewProfileController(ViewProfileImporter viewProfileImporter, ViewProfileService viewProfileService) {
        this.viewProfileImporter = viewProfileImporter;
        this.viewProfileService = viewProfileService;
    }

    @ApiOperation(value = "Creates a view profile for the given consultant",
        notes = "A consultant is always represented by their unique initials. The created view profile is based around the" +
                " current base data that are available.",
        response = ViewProfile.class,
        httpMethod = "POST",
        produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "Returns the newly created view profile in the response")
    })
    @PostMapping(path = "/{initials}")
    public ResponseEntity<ViewProfile> createViewProfile(
            @ApiParam("Initials of the consultant for which the profile is created") @PathVariable("initials") String initials) {
        ViewProfile viewProfile = viewProfileImporter.importViewProfile(initials);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(
            value = "Returns a consultant's view profile ids",
            notes = "Returns all view profile ids of a given consultant. " +
                    "A consultant is always represented by their unique initials. Does not " +
                    "validate if the initials belong to a consultant. If the consultant does not" +
                    " exist, the endpoint returns an empty list.",
            response = String.class,
            responseContainer = "List",
            httpMethod = "GET",
            produces = "application/json"
    )
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "Success. All view profile IDs are in response."),
    })
    @GetMapping(path = "/{initials}")
    public ResponseEntity< List<String>> getAllViewProfiles(@PathVariable("initials") String initials) {
        List<String> ids = viewProfileService.getViewProfileIdsForInitials(initials);
        return ResponseEntity.ok(ids);
    }


    @ApiOperation(
            value = "Returns a specified view profile.",
            notes = "Returns the specified consultants view profile. Only returns the view profile" +
                    "if it belongs to the consultant. ",
            response = String.class,
            responseContainer = "List",
            httpMethod = "GET",
            produces = "application/json"
    )
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "View profile is returned in response."),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
    @GetMapping(path = "/{initials}/{id}")
    public ResponseEntity<ViewProfile> getViewProfile(@PathVariable("initials") String initials, @PathVariable String id) {
        return ResponseEntity.ok(viewProfileService.getByIdAndCheckOwner(id, initials));
    }

    @ApiOperation(
            value = "Deletes the specified view profile",
            notes = "Deletes the specified view profile of the specified consultant.",
            response = Void.class,
            httpMethod = "DELETE"
    )
    @ApiResponses(value ={
            @ApiResponse(code = 204, message = "The view profile has been deleted."),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
    @DeleteMapping(path = "/{initials}/{id}")
    public ResponseEntity deleteViewProfile(@PathVariable("initials") String initials, @PathVariable String id) {
        viewProfileService.deleteWithOwnerCheck(id, initials);
        return ResponseEntity.noContent().build();
    }
}
