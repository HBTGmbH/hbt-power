package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.exception.ServiceError;
import de.hbt.pwr.view.model.ProfileEntryType;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.sort.NameComparableEntryType;
import de.hbt.pwr.view.model.entries.sort.StartEndDateComparableEntryType;
import de.hbt.pwr.view.service.ViewProfileService;
import de.hbt.pwr.view.service.ViewProfileSortService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

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
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
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

    @PatchMapping("/SKILL/visibility/{isEnabled}")
    ResponseEntity<ViewProfile> setVisibilityForSkill(@PathVariable("initials") String initials,
                                                      @PathVariable("viewProfileId") String viewProfileId,
                                                      @RequestParam(value = "skill-name", required = false) String skillName,
                                                      @PathVariable("isEnabled") Boolean isEnabled) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        if(skillName == null) {
            viewProfileService.setIsEnabledForAllSkills(viewProfile, isEnabled);
        } else {
            viewProfileService.setIsEnabledForSkill(viewProfile, skillName, isEnabled);
        }
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
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
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
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
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
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
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
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
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
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
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
            @ApiResponse(code = 400, message = "The category was not direct or indirect parent to the skill", response = ServiceError.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
    @PatchMapping("/SKILL/display-category")
    ResponseEntity<ViewProfile> setDisplayCategory(@PathVariable("initials") String initials,
                                                   @PathVariable("viewProfileId") String viewProfileId,
                                                   @RequestParam("skill-name") String skillName,
                                                   @RequestParam("display-category") String newDisplayCategoryName) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setDisplayCategory(viewProfile, skillName, newDisplayCategoryName);
        return ResponseEntity.ok(viewProfile);
    }


    @ApiOperation(value = "Sorts all skills in a display category.",
            notes = "Sorts all skills in the given display category alphabetically by their name and returns " +
                    "the changed view profile.",
            response = ViewProfile.class,
            httpMethod = "PATCH",
            produces = "application/json")

    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = Void.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
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

    @ApiOperation(value = "Sorts entries by start date TODO nt / document this")
    @PatchMapping("/{entryType}/start-date/order")
    ResponseEntity<ViewProfile> sortStartDateSortable(@PathVariable("initials") String initials,
                                                      @PathVariable("viewProfileId") String viewProfileId,
                                                      @PathVariable("entryType") StartEndDateComparableEntryType entryType,
                                                      @RequestParam("do-ascending") boolean doAscending) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.sortEntryByStartDate(viewProfile, entryType, doAscending);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Sorts entries by end date TODO nt / document this")
    @PatchMapping("/{entryType}/end-date/order")
    ResponseEntity<ViewProfile> sortEndDateSortable(@PathVariable("initials") String initials,
                                                    @PathVariable("viewProfileId") String viewProfileId,
                                                    @PathVariable("entryType") StartEndDateComparableEntryType entryType,
                                                    @RequestParam("do-ascending") boolean doAscending) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.sortEntryByEndDate(viewProfile, entryType, doAscending);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Changes the description TODO nt / document this")
    @PatchMapping("/DESCRIPTION")
    ResponseEntity<ViewProfile> setDescription(@PathVariable("initials") String initials,
                                               @PathVariable("viewProfileId") String viewProfileId,
                                               @RequestBody() String newDescription) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setDescription(viewProfile, newDescription);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Creates a new category TODO nt document this")
    @PostMapping("/CATEGORY")
    ResponseEntity<ViewProfile> addCategory(@PathVariable("initials") String initials,
                                            @PathVariable("viewProfileId") String viewProfileId,
                                            @RequestParam("parent-name") String parentName,
                                            @RequestParam("category-name") String newCategoryName) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.addNewCategory(viewProfile, parentName, newCategoryName);
        return ResponseEntity.ok(viewProfile);
    }

    @PatchMapping("/SKILL/CATEGORY")
    ResponseEntity<ViewProfile> moveSkill(@PathVariable("initials") String initials,
                                          @PathVariable("viewProfileId") String viewProfileId,
                                          @RequestParam("skill-name") String skillName,
                                          @RequestParam("category-name") String categoryName) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.moveSkill(viewProfile, skillName, categoryName);
        return ResponseEntity.ok(viewProfile);
    }
}
