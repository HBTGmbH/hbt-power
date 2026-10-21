package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.model.check.ProfileCheckSummary;
import de.hbt.pwr.profile.model.check.ProfileConfirmation;
import de.hbt.pwr.profile.service.ProfileCheckService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Profile check for admins (#139); below /admin, which the edge service restricts to Power.Admin
 */
@RestController
@RequestMapping(value = "/admin/profile-checks", produces = "application/json")
public class ProfileCheckAdminEndpoint {

    private final ProfileCheckService profileCheckService;

    public ProfileCheckAdminEndpoint(ProfileCheckService profileCheckService) {
        this.profileCheckService = profileCheckService;
    }

    @GetMapping
    public List<ProfileCheckSummary> getSummaries() {
        return profileCheckService.summaries();
    }

    @GetMapping("/{initials}/confirmations")
    public List<ProfileConfirmation> getConfirmations(@PathVariable("initials") String initials) {
        return profileCheckService.confirmations(initials);
    }
}
