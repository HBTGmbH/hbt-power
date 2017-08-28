package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.model.ProfileEntryType;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.service.ViewProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controls operations that can be performed on a view profile
 */
@Controller
@RequestMapping("/{initials}/view/{viewProfileId}")
public class ViewProfileOperationsController {

    private final ViewProfileService viewProfileService;

    @Autowired
    public ViewProfileOperationsController(ViewProfileService viewProfileService) {
        this.viewProfileService = viewProfileService;
    }

    @PatchMapping("/{entryType}/{index}/visibility/{isEnabled}")
    ResponseEntity<ViewProfile> setVisibility(@PathVariable("initials") String initials,
                                              @PathVariable("viewProfileId") String viewProfileId,
                                              @PathVariable("entryType") ProfileEntryType profileEntryType,
                                              @PathVariable("index") int index,
                                              @PathVariable("isEnabled") Boolean isEnabled) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setEntryEnabled(viewProfile, index, isEnabled, profileEntryType);
        return ResponseEntity.ok(viewProfile);
    }

    @PatchMapping("/{entryType}/all/visibility/{isEnabled}")
    ResponseEntity<ViewProfile> setEnabledForAll(@PathVariable("initials") String initials,
                                                 @PathVariable("viewProfileId") String viewProfileId,
                                                 @PathVariable("entryType") ProfileEntryType profileEntryType,
                                                 @PathVariable("isEnabled") Boolean isEnabled) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setIsEnabledForAll(viewProfile, profileEntryType, isEnabled);
        return ResponseEntity.ok(viewProfile);
    }

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

    @PatchMapping("/PROJECT/{projectIndex}/SKILL/all/visibility/{isEnabled}")
    ResponseEntity<ViewProfile> setVisibilityForAllSkillsInProject(@PathVariable("initials") String initials,
                                                                   @PathVariable("viewProfileId") String viewProfileId,
                                                                   @PathVariable("projectIndex") int projectIndex,
                                                                   @PathVariable("isEnabled") boolean isEnabled) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setIsEnabledForAllSkillsInProject(viewProfile, projectIndex, isEnabled);
        return ResponseEntity.ok(viewProfile);
    }

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

    @PatchMapping("/PROJECT/{projectIndex}/ROLE/all/visibility/{isEnabled}")
    ResponseEntity<ViewProfile> setVisibilityForAllRolesInProject(@PathVariable("initials") String initials,
                                                                 @PathVariable("viewProfileId") String viewProfileId,
                                                                 @PathVariable("projectIndex") int projectIndex,
                                                                 @PathVariable("isEnabled") boolean isEnabled) {
        ViewProfile viewProfile = viewProfileService.getByIdAndCheckOwner(viewProfileId, initials);
        viewProfileService.setIsEnabledForAllRolesInProject(viewProfile, projectIndex, isEnabled);
        return ResponseEntity.ok(viewProfile);
    }
}
