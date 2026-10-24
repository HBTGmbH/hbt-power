package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.model.notification.AdminNotification;
import de.hbt.pwr.profile.service.AdminNotificationService;
import de.hbt.pwr.profile.service.ProfileService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import static org.springframework.http.ResponseEntity.accepted;
import static org.springframework.http.ResponseEntity.noContent;
import static org.springframework.web.bind.annotation.RequestMethod.HEAD;

@RestController
@RequestMapping("/admin")
@Api(value = "Admin resource", produces = "application/json")
public class AdminEndpoint {

    private final AdminNotificationService adminNotificationService;
    private final ProfileService profileService;

    @Autowired
    public AdminEndpoint(AdminNotificationService adminNotificationService, ProfileService profileService) {
        this.adminNotificationService = adminNotificationService;
        this.profileService = profileService;
    }

    @ApiOperation(
            value = "Checks if the user is authenticated.",
            notes = "Used to work around a missing granted authority implementation. Calling this endpoint with the " +
                    "appropriate authentication headers set will return 200 if the authentication is successful.",
            response = Void.class,
            httpMethod = "HEAD"
    )
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Authenticated."),
            @ApiResponse(code = 403, message = "User is not an admin"),
            @ApiResponse(code = 401, message = "Missing authorization header")
    })
    @RequestMapping(path = "/", method = HEAD)
    public ResponseEntity isAuthenticated() {
        return accepted().build();
    }

    @GetMapping(path = "/notifications", produces = "application/json")
    @ApiOperation(
            value = "Returns all non-trashed admin notificatuions",
            notes = "Returns a list of admin notifications that have not been moved to the trash bin.",
            response = AdminNotification.class,
            responseContainer = "List"
    )
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Notifications are in response. List might be empty.")
    })
    public Collection<AdminNotification> getAllAlive() {
        return adminNotificationService.findAllAlive();
    }

    @PutMapping(path = "/notifications/{id}", consumes = "application/json")
    @ApiOperation(value = "Executes the Notification Operation 'OK'",
            notes = "Executes the OK operation that is defined with the notification and then deletes the notification itself"
    )
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "OK Action executed and notification deleted.")
    })
    public void executeOkNotificationOperation(@PathVariable("id") Long id) {
        adminNotificationService.findById(id)
                .ifPresent(notification -> notification.executeOKAction(adminNotificationService));
    }

    @DeleteMapping(path = "/notifications/{id}", consumes = "application/json")
    @ApiOperation(value = "Executes the Notification Operation 'DELETE'",
            notes = "Executes the deletion operation that is defined with the notification and then deletes the notification itself"
    )
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Notification was deleted.")
    })
    public void executeDeleteNotificationOperation(@PathVariable("id") Long id) {
        adminNotificationService.findById(id)
                .ifPresent(notification -> notification.executeDeleteAction(adminNotificationService));
    }

    @PatchMapping(path = "/notifications", consumes = "application/json")
    @ApiOperation(value = "Executes the Notification Operation 'PATCH'",
            notes = "Executes the edit operation that is defined with the notification and then deletes the notification itself"
    )
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Patch action executed and notification deleted.")
    })
    public void executeNotificationOperation(@RequestBody AdminNotification notification) {
        notification.executeEditAction(adminNotificationService);
    }


    @GetMapping(path = "/notifications/trash", produces = "application/json")
    @ApiOperation(value = "Returns all available admin notifications that are trashed",
            notes = "Trashed notifications are notifications that have been marked for deletion.")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Trashed notifications returned", response = List.class)
    })
    public Collection<AdminNotification> getAllTrashed() {
        return adminNotificationService.findAllTrashed();
    }


    @PutMapping(path = "/notifications/trash", produces = "application/json")
    public void trashNotifications(@RequestBody List<Long> ids) {
        ids.forEach(adminNotificationService::trashById);
    }

    @DeleteMapping("/notifications/trash")
    public void deleteTrashed() {
        adminNotificationService.trashAllDeleted();
    }

    /**
     * How many consultants use each skill, by the name of the skill tree (#271)
     */
    @GetMapping("/skills/usage")
    public Map<String, Integer> countSkillUsers() {
        return profileService.countSkillUsers();
    }

    @ApiOperation(
            value = "Merges a skill into another one, in the skill tree and in all profiles and projects",
            notes = "The source becomes an alias of the target. Where a profile has both, the target keeps the higher " +
                    "rating and the versions of both. The optional version is added wherever the source was. Idempotent."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 204, message = "Merged."),
            @ApiResponse(code = 400, message = "Source and target are the same skill"),
            @ApiResponse(code = 404, message = "The target is no skill"),
            @ApiResponse(code = 409, message = "The source is an alias of another skill")
    })
    @PostMapping("/skills/merge")
    public ResponseEntity mergeSkills(@NotNull @RequestParam("source") String source,
                                      @NotNull @RequestParam("target") String target,
                                      @RequestParam(value = "version", required = false) String version) {
        profileService.mergeSkills(source, target, version);
        return noContent().build();
    }

    @ApiOperation(
            value = "Renames a skill of the skill tree, in the tree and in all profiles and projects (#228)",
            notes = "The old name becomes an alias. A profile that has the new name too keeps one skill, like a merge."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 204, message = "Renamed."),
            @ApiResponse(code = 400, message = "No name"),
            @ApiResponse(code = 404, message = "The skill tree has no skill of this name"),
            @ApiResponse(code = 409, message = "The new name is the name or an alias of another skill")
    })
    @PostMapping("/skills/rename")
    public ResponseEntity renameSkill(@NotNull @RequestParam("name") String name,
                                      @NotNull @RequestParam("newName") String newName) {
        profileService.renameSkill(name, newName);
        return noContent().build();
    }

    @ApiOperation(
            value = "Deletes a skill from all profiles and projects and from the skill tree (#229)",
            notes = "Under its name and its aliases, in any case."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 204, message = "Deleted."),
            @ApiResponse(code = 404, message = "The skill tree has no skill of this name")
    })
    @DeleteMapping("/skills")
    public ResponseEntity deleteSkill(@NotNull @RequestParam("name") String name) {
        profileService.deleteSkill(name);
        return noContent().build();
    }
}
