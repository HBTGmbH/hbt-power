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

/**
 * <strong>For documentation, launch the service and go to <a href="http://localhost:9008/swagger-ui.html"> the
 * swagger UI documentation</a></strong> <em>(actual port may differ)</em>
 * <p>
 *     Contains 'elemental' operations for {@link ViewProfile}, create, read and delete. Updates are performed as partial
 *     updates in the {@link ViewProfileOperationsController}
 * </p>
 * <p>
 *     <strong>A note on security</strong>: View profiles are only accessible with the right combination of ID and initials. If the
 *     {@link ViewProfile} with the given ID does not have the correct owner, an operation will fail. This itself
 *     is only pseudo-security, as the initials may be changed at will. In later development stages, a security concept
 *     based around the edge server may be implemented such that users will only ever be able to access their own
 *     spaces of the services.
 *     <br/>
 *     <br/>
 *     Example: User 'tst' can only access <code>/api/tst/**</code>, but not <code>/api/xyz/**</code>,
 *     as the <code>/api/xyz/**</code> endpoints are protected by the security framework.
 *     <br/>
 *     <br/>
 *     This is why this service checks the owner initials with the initials provided in the request.
 * </p>
 * @see  <a href="http://localhost:9008/swagger-ui.html">Swagger UI doc</a>
 * @author nt (nt@hbt.de)
 */
@Api(value = "/view", description = "Creates, reads and deletes view profiles")
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
            @ApiResponse(code = 200, message = "Returns the newly created view profile in the response", response = ViewProfile.class),
            @ApiResponse(code = 400, message = "Could not retrieve profile for given initials", response = ServiceError.class)
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
            notes = "Returns the view profile with the given ID as long as it belongs to the consultant with the provided initials",
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
