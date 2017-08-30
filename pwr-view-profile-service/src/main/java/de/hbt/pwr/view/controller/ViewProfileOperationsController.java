package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.exception.DisplayCategoryNotFoundException;
import de.hbt.pwr.view.exception.InvalidOwnerException;
import de.hbt.pwr.view.exception.ViewProfileNotFoundException;
import de.hbt.pwr.view.model.ProfileEntryType;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.sort.NameComparableEntryType;
import de.hbt.pwr.view.model.entries.sort.ProjectSortableField;
import de.hbt.pwr.view.service.ViewProfileService;
import de.hbt.pwr.view.service.ViewProfileSortService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Controls operations that can be performed on a view profile
 */
@Api(
        basePath = "/{initials}/view/{viewProfileId}",
        description = "Provides means to perform operations on a view profile. All operations are persistent. No " +
                "further operations are required to persistently store the information. Results are directly returned" +
                "in the response body of the request.",
        value = "View Profile Operations"
)
@Controller
@RequestMapping("/{initials}/view/{viewProfileId}")
public class ViewProfileOperationsController {

    private final ViewProfileSortService viewProfileSortService;

    private final ViewProfileService viewProfileService;

    @Autowired
    public ViewProfileOperationsController(ViewProfileSortService viewProfileSortService, ViewProfileService viewProfileService) {
        this.viewProfileSortService = viewProfileSortService;
        this.viewProfileService = viewProfileService;
    }


    @ApiOperation(value = "Sets the visibility of an entry",
            notes = "Sets the visibility of a view profile entry and returns the updates view profile. This operation" +
                    " is directly persistent, no further actions are necessary to save the view profile.",
            response = ViewProfile.class,
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = Void.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = InvalidOwnerException.Error.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ViewProfileNotFoundException.Error.class)
    })
    @PatchMapping("/{entryType}/{index}/visibility/{isEnabled}")
    ResponseEntity<ViewProfile> setVisibility(@PathVariable("initials") String initials,
                                              @PathVariable("viewProfileId") String viewProfileId,
                                              @PathVariable("entryType") ProfileEntryType profileEntryType,
                                              @PathVariable("index") int index,
                                              @PathVariable("isEnabled") Boolean isEnabled) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setIsEnabled(viewProfile, index, isEnabled, profileEntryType);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Sets the visibility for all entries",
            notes = "Sets the visibility for all entries of the given type in the defined view profile. " +
                    "This operation is persistent.",
            response = ViewProfile.class,
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = Void.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = InvalidOwnerException.Error.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ViewProfileNotFoundException.Error.class)
    })
    @PatchMapping("/{entryType}/all/visibility/{isEnabled}")
    ResponseEntity<ViewProfile> setEnabledForAll(@PathVariable("initials") String initials,
                                                 @PathVariable("viewProfileId") String viewProfileId,
                                                 @PathVariable("entryType") ProfileEntryType profileEntryType,
                                                 @PathVariable("isEnabled") Boolean isEnabled) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setIsEnabledForAll(viewProfile, profileEntryType, isEnabled);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Sets the visibility for a nested skill",
            notes = "Sets the visibility for a skill that is nested inside a project. Does not the master skill list. " +
                    "This operation is persistent.",
            response = ViewProfile.class,
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = Void.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = InvalidOwnerException.Error.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ViewProfileNotFoundException.Error.class)
    })
    @PatchMapping("/PROJECT/{projectIndex}/SKILL/{skillIndex}/visibility/{isEnabled}")
    ResponseEntity<ViewProfile> setVisibilityForSkillInProject(@PathVariable("initials") String initials,
                                                               @PathVariable("viewProfileId") String viewProfileId,
                                                               @PathVariable("projectIndex") int projectIndex,
                                                               @PathVariable("skillIndex") int skillIndex,
                                                               @PathVariable("isEnabled") boolean isEnabled) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setSkillInProjectEnabled(viewProfile, projectIndex, skillIndex, isEnabled);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Sets the visibility for all nested skills",
            notes = "Sets the visibility for all nested skills of a specified project. Does not affect the master " +
                    "skill list. This operation is persistent.",
            response = ViewProfile.class,
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = Void.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = InvalidOwnerException.Error.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ViewProfileNotFoundException.Error.class)
    })
    @PatchMapping("/PROJECT/{projectIndex}/SKILL/all/visibility/{isEnabled}")
    ResponseEntity<ViewProfile> setVisibilityForAllSkillsInProject(@PathVariable("initials") String initials,
                                                                   @PathVariable("viewProfileId") String viewProfileId,
                                                                   @PathVariable("projectIndex") int projectIndex,
                                                                   @PathVariable("isEnabled") boolean isEnabled) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setIsEnabledForAllSkillsInProject(viewProfile, projectIndex, isEnabled);
        return ResponseEntity.ok(viewProfile);
    }


    @ApiOperation(value = "Sets the visibility for a nested project role",
            notes = "Sets the visibility for all nested project role of the specified project. Does not affect the " +
                    "master project role list. This operation is persistent.",
            response = ViewProfile.class,
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = Void.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = InvalidOwnerException.Error.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ViewProfileNotFoundException.Error.class)
    })
    @PatchMapping("/PROJECT/{projectIndex}/ROLE/{roleIndex}/visibility/{isEnabled}")
    ResponseEntity<ViewProfile> setVisibilityForRoleInProject(@PathVariable("initials") String initials,
                                                              @PathVariable("viewProfileId") String viewProfileId,
                                                              @PathVariable("projectIndex") int projectIndex,
                                                              @PathVariable("roleIndex") int roleIndex,
                                                              @PathVariable("isEnabled") boolean isEnabled) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setRoleInProjectEnabled(viewProfile, projectIndex, roleIndex, isEnabled);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Sets the visibility for all nested project roles",
            notes = "Sets the visibility for all nested project roles of a specified project. Does not affect the " +
                    "master role list. This operation is persistent.",
            response = ViewProfile.class,
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = Void.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = InvalidOwnerException.Error.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ViewProfileNotFoundException.Error.class)
    })
    @PatchMapping("/PROJECT/{projectIndex}/ROLE/all/visibility/{isEnabled}")
    ResponseEntity<ViewProfile> setVisibilityForAllRolesInProject(@PathVariable("initials") String initials,
                                                                 @PathVariable("viewProfileId") String viewProfileId,
                                                                 @PathVariable("projectIndex") int projectIndex,
                                                                 @PathVariable("isEnabled") boolean isEnabled) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setIsEnabledForAllRolesInProject(viewProfile, projectIndex, isEnabled);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Sets the display category of a skill",
            notes = "Sets the display category of a skill provided the display category is a direct or indirect parent " +
                    "to the skill. ",
            response = ViewProfile.class,
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = Void.class),
            @ApiResponse(code = 400, message = "The category was not direct or indirect parent to the skill", response = DisplayCategoryNotFoundException.Error.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = InvalidOwnerException.Error.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ViewProfileNotFoundException.Error.class)
    })
    @PatchMapping("/SKILL/{skillIndex}/display-category")
    ResponseEntity<ViewProfile> setDisplayCategory(@PathVariable("initials") String initials,
                                                   @PathVariable("viewProfileId") String viewProfileId,
                                                   @PathVariable("skillIndex") int skillIndex,
                                                   @RequestParam("display-category") String newDisplayCategoryName) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setDisplayCategory(viewProfile, skillIndex, newDisplayCategoryName);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Sorts all skills in a display category")
    @PatchMapping( "/DISPLAY_CATEGORY/{displayCategoryIndex}/SKILL/name/order")
    ResponseEntity<ViewProfile> sortSkillsByNameInDisplayCategory(@PathVariable("initials") String initials,
                                                                  @PathVariable("viewProfileId") String viewProfileId,
                                                                  @PathVariable("displayCategoryIndex") int displayCategoryIndex,
                                                                  @RequestParam("do-ascending") boolean doAscending) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.sortSkillsInDisplayByName(viewProfile, displayCategoryIndex, doAscending);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Sorts all skills in a display category")
    @PatchMapping( "/DISPLAY_CATEGORY/{displayCategoryIndex}/SKILL/rating/order")
    ResponseEntity<ViewProfile> sortSkillsByRatingInDisplayCategory(@PathVariable("initials") String initials,
                                                                    @PathVariable("viewProfileId") String viewProfileId,
                                                                    @PathVariable("displayCategoryIndex") int displayCategoryIndex,
                                                                    @RequestParam("do-ascending") boolean doAscending) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.sortSkillsInDisplayByRating(viewProfile, displayCategoryIndex, doAscending);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Moves a skill in a display category")
    @PatchMapping("/DISPLAY_CATEGORY/{displayCategoryIndex}/SKILL/position/{sourceIndex}/{targetIndex}")
    ResponseEntity<ViewProfile> moveSkillInDisplayCategory(@PathVariable("initials") String initials,
                                                           @PathVariable("viewProfileId") String viewProfileId,
                                                           @PathVariable("displayCategoryIndex") int displayCategoryIndex,
                                                           @PathVariable("sourceIndex") int sourceIndex,
                                                           @PathVariable("targetIndex") int targetIndex) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.moveSkillInDisplayCategory(viewProfile, displayCategoryIndex, sourceIndex, targetIndex);
        return ResponseEntity.ok(viewProfile);
    }


    @ApiOperation(value = "Moves a movable entry")
    @PatchMapping("/{movable-entry}/position/{sourceIndex}/{targetIndex}")
    ResponseEntity<ViewProfile> moveMovable(@PathVariable("initials") String initials,
                                            @PathVariable("viewProfileId") String viewProfileId,
                                            @PathVariable("movable-entry") ProfileEntryType profileEntryType,
                                            @PathVariable("sourceIndex") int sourceIndex,
                                            @PathVariable("targetIndex") int targetIndex) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.move(viewProfile, profileEntryType, sourceIndex, targetIndex);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Sorts entries by name TODO nt / document this")
    @PatchMapping("/{entryType}/name/order")
    ResponseEntity<ViewProfile> sortNameSortable(@PathVariable("initials") String initials,
                                                 @PathVariable("viewProfileId") String viewProfileId,
                                                 @PathVariable("entryType") NameComparableEntryType entryType,
                                                 @RequestParam("do-ascending") boolean doAscending) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.sortEntryByName(viewProfile, entryType, doAscending);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Sorts all projects")
    @PatchMapping("/PROJECT/{sortable-field}/order")
    ResponseEntity<ViewProfile> sortProjects(@PathVariable("initials") String initials,
                                             @PathVariable("viewProfileId") String viewProfileId,
                                             @PathVariable("sortable-field") ProjectSortableField sortableField,
                                             @RequestParam("do-ascending") boolean doAscending) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        sortableField.invokeSort(viewProfileSortService, viewProfile, doAscending);
        return ResponseEntity.ok(viewProfile);
    }
}
