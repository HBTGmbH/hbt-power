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

    @PatchMapping("/skills/name")
    public ResponseEntity renameSkillInAllProfiles(@NotNull @RequestParam("oldname") String oldName, @NotNull @RequestParam("newname") String newName) {
        profileService.renameAndMergeSkills(oldName, newName);
        return noContent().build();
    }
}
