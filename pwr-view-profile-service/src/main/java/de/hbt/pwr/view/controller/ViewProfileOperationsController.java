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
 * For documentation, launch the service and go to <a href="http://localhost:9008/swagger-ui.html"> the swagger UI documentation</a>
 * <p>
 *     Persistent operations that affect a {@link ViewProfile} belong here.
 * </p>
 * @see  <a href="http://localhost:9008/swagger-ui.html">Swagger UI doc</a>
 * @author nt (nt@hbt.de)
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
            tags = {"toggling", "entry"},
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

    @ApiOperation(value = "Sets the visibility for skills",
            notes = "Sets the visibility for a skill or for all skills at once.",
            response = ViewProfile.class,
            tags = {"toggling", "skill"},
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = Void.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
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
            tags = {"toggling", "entry"},
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
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
            tags = {"toggling", "skill"},
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
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
            tags = {"toggling", "skill"},
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
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
            tags = {"toggling", "role"},
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
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
            tags = {"toggling", "role"},
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
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
            tags = {"skill"},
            response = ViewProfile.class,
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
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


    @ApiOperation(value = "Sorts all skills in a display category by name",
            notes = "Sorts all skills in the given display category alphabetically by their name and returns " +
                    "the changed and persisted view profile.",
            response = ViewProfile.class,
            tags = {"sorting", "skill"},
            httpMethod = "PATCH",
            produces = "application/json")

    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
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

    @ApiOperation(value = "Sorts all skills in a display category by rating",
            notes = "Sorts all skills in the given display category numerically by their rating and returns the changed" +
                    " and persisted view profile.",
            response = ViewProfile.class,
            httpMethod = "PATCH",
            tags = {"sorting", "skill"},
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
    @PatchMapping( "/DISPLAY_CATEGORY/{displayCategoryIndex}/SKILL/rating/order")
    ResponseEntity<ViewProfile> sortSkillsByRatingInDisplayCategory(@PathVariable("initials") String initials,
                                                                    @PathVariable("viewProfileId") String viewProfileId,
                                                                    @PathVariable("displayCategoryIndex") int displayCategoryIndex,
                                                                    @RequestParam("do-ascending") boolean doAscending) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.sortSkillsInDisplayByRating(viewProfile, displayCategoryIndex, doAscending);
        return ResponseEntity.ok(viewProfile);
    }

    @PatchMapping("/PROJECT/{projectIndex}/SKILL/name/order")
    ResponseEntity<ViewProfile> sortSkillsByNameInProject(@PathVariable("initials") String initials,
                                                          @PathVariable("viewProfileId") String viewProfileId,
                                                          @PathVariable("projectIndex") int projectIndex,
                                                          @RequestParam("do-ascending") boolean doAscending) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.sortSkillsInProjectByName(viewProfile, projectIndex, doAscending);
        return ResponseEntity.ok(viewProfile);
    }

    @PatchMapping("/PROJECT/{projectIndex}/SKILL/rating/order")
    ResponseEntity<ViewProfile> sortSkillsByRatingInProject(@PathVariable("initials") String initials,
                                                          @PathVariable("viewProfileId") String viewProfileId,
                                                          @PathVariable("projectIndex") int projectIndex,
                                                          @RequestParam("do-ascending") boolean doAscending) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.sortSkillsInProjectByRating(viewProfile, projectIndex, doAscending);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Moves a skill in a display category",
            notes = "Moves a skill from one index to another index in a given display category",
            response = ViewProfile.class,
            httpMethod = "PATCH",
            tags = {"moving", "skill"},
            produces = "application/json")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
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

    @PatchMapping("/PROJECT/{projectIndex}/SKILL/position/{sourceIndex}/{targetIndex}")
    ResponseEntity<ViewProfile> moveSkillInProject(@PathVariable("initials") String initials,
                                                   @PathVariable("viewProfileId") String viewProfileId,
                                                   @PathVariable("projectIndex") int projectIndex,
                                                   @PathVariable("sourceIndex") int sourceIndex,
                                                   @PathVariable("targetIndex") int targetIndex) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.moveSkillInProject(viewProfile, projectIndex, sourceIndex, targetIndex);
        return ResponseEntity.ok(viewProfile);
    }


    @ApiOperation(value = "Moves a movable entry",
            notes = "Moves (shifts) a movable entry from one index to another index while shifting all values that " +
                    "are between those.",
            response = ViewProfile.class,
            tags = {"moving", "entry"},
            produces = "application/json",
            httpMethod = "PATCH")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
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

    @ApiOperation(value = "Sorts entries by name",
            notes = "Sorts entries alphabetically by their name.",
            response = ViewProfile.class,
            tags = {"sorting", "entry"},
            produces = "application/json",
            httpMethod = "PATCH")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
    @PatchMapping("/{entryType}/name/order")
    ResponseEntity<ViewProfile> sortNameSortable(@PathVariable("initials") String initials,
                                                 @PathVariable("viewProfileId") String viewProfileId,
                                                 @PathVariable("entryType") NameComparableEntryType entryType,
                                                 @RequestParam("do-ascending") boolean doAscending) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.sortEntryByName(viewProfile, entryType, doAscending);
        return ResponseEntity.ok(viewProfile);
    }


    @ApiOperation(value = "Sorts entries by start date",
                notes = "Sorts all entries of a given type by their start date, where the lowest start date is furthest " +
                        "in the past",
                tags = {"sorting", "entry"},
                produces = "application/json",
                httpMethod = "PATCH")
    @PatchMapping("/{entryType}/start-date/order")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
    ResponseEntity<ViewProfile> sortStartDateSortable(@PathVariable("initials") String initials,
                                                      @PathVariable("viewProfileId") String viewProfileId,
                                                      @PathVariable("entryType") StartEndDateComparableEntryType entryType,
                                                      @RequestParam("do-ascending") boolean doAscending) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.sortEntryByStartDate(viewProfile, entryType, doAscending);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Sorts entries by end date",
            notes = "Sorts all entries of a given type by their end date, where the lowest end date is furthest " +
            "in the past",
            tags = {"sorting", "entry"},
            produces = "application/json",
            httpMethod = "PATCH")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
    @PatchMapping("/{entryType}/end-date/order")
    ResponseEntity<ViewProfile> sortEndDateSortable(@PathVariable("initials") String initials,
                                                    @PathVariable("viewProfileId") String viewProfileId,
                                                    @PathVariable("entryType") StartEndDateComparableEntryType entryType,
                                                    @RequestParam("do-ascending") boolean doAscending) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileSortService.sortEntryByEndDate(viewProfile, entryType, doAscending);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Changes the description",
            notes = "Changes the description of a view profile",
            produces = "application/json",
            httpMethod = "PATCH")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class)
    })
    @PatchMapping("/DESCRIPTION")
    ResponseEntity<ViewProfile> setDescription(@PathVariable("initials") String initials,
                                               @PathVariable("viewProfileId") String viewProfileId,
                                               @RequestBody() String newDescription) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setDescription(viewProfile, newDescription);
        return ResponseEntity.ok(viewProfile);
    }

    @ApiOperation(value = "Creates a new category",
            notes = "Creates a new category as child to the provide category. This operation only affects the view profile.",
            tags = {"category"},
            produces = "application/json",
            httpMethod = "POST")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class),
            @ApiResponse(code = 400, message = "Either the provided parent-name did not match an existing category or the" +
                    " provided category-name is not unique (a category with the same name alredy exists).",
                    response = ServiceError.class)
    })
    @RequestMapping(value = "/CATEGORY", method = RequestMethod.POST)
    ResponseEntity<ViewProfile> addCategory(@PathVariable("initials") String initials,
                                            @PathVariable("viewProfileId") String viewProfileId,
                                            @RequestParam("parent-name") String parentName,
                                            @RequestParam("category-name") String newCategoryName) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.addNewCategory(viewProfile, parentName, newCategoryName);
        return ResponseEntity.ok(viewProfile);
    }



    @ApiOperation(value = "Moves a skill to a new category",
            notes = "Moves a skill from one category to another category if the new category exists. Also recalculates " +
                    "the display category. This operation should only be used if the resulting problem can't be solved " +
                    "by changing the display category, e.g. when the skill is in a different category branch.",
            tags = {"skill"},
            produces = "application/json",
            httpMethod = "PATCH")
    @ApiResponses(value ={
            @ApiResponse(code = 200, message = "The updated view profile is returned in the response", response = ViewProfile.class),
            @ApiResponse(code = 403, message = "Access to the view profile is not allowed.", response = ServiceError.class),
            @ApiResponse(code = 404, message = "No view profile for the provided ID found.", response = ServiceError.class),
            @ApiResponse(code = 400, message = "No category for the given category-name found.", response = ServiceError.class)
    })
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
