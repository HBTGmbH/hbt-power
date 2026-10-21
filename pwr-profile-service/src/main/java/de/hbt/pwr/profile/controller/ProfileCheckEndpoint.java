package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.model.check.ProfileCheck;
import de.hbt.pwr.profile.service.ProfileCheckService;
import org.springframework.web.bind.annotation.*;

/**
 * Profile check (#139): what is missing or outdated in a profile, and "my profile is up to date"
 */
@RestController
@RequestMapping(value = "/profile/{initials}/check", produces = "application/json")
public class ProfileCheckEndpoint {

    /**
     * Set by the edge service from the verified token; it removes headers of the same name sent by a client (#139)
     */
    static final String USER_LOGIN_HEADER = "X-Pwr-User-Login";
    static final String USER_INITIALS_HEADER = "X-Pwr-User-Initials";
    /** Without the edge service (local development) there is no account */
    static final String LOCAL_LOGIN = "lokal";

    private final ProfileCheckService profileCheckService;

    public ProfileCheckEndpoint(ProfileCheckService profileCheckService) {
        this.profileCheckService = profileCheckService;
    }

    @GetMapping
    public ProfileCheck getCheck(@PathVariable("initials") String initials) {
        return profileCheckService.check(initials);
    }

    @PostMapping("/confirmation")
    public ProfileCheck confirm(@PathVariable("initials") String initials,
                                @RequestHeader(value = USER_LOGIN_HEADER, required = false) String login,
                                @RequestHeader(value = USER_INITIALS_HEADER, required = false) String accountInitials) {
        String who = login == null || login.trim().isEmpty() ? LOCAL_LOGIN : login.trim();
        return profileCheckService.confirm(initials, who, accountInitials);
    }
}
