package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.model.HousekeepingFindings;
import de.hbt.pwr.profile.service.housekeeping.HousekeepingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Housekeeping of the data of the profile service (#242); the edge lets only admins through to {@code /admin}
 */
@RestController
@RequestMapping("/admin/housekeeping")
public class HousekeepingAdminEndpoint {

    private final HousekeepingService housekeepingService;

    public HousekeepingAdminEndpoint(HousekeepingService housekeepingService) {
        this.housekeepingService = housekeepingService;
    }

    @GetMapping
    public List<HousekeepingFindings> check() {
        return housekeepingService.check();
    }

    /** Deletes what the check finds now; the answer says how many */
    @DeleteMapping("{check}")
    public HousekeepingFindings clean(@PathVariable("check") String check) {
        return new HousekeepingFindings(check, housekeepingService.clean(check), List.of(), null);
    }
}
