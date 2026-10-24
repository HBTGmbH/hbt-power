package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.model.HousekeepingFindings;
import de.hbt.pwr.view.service.housekeeping.HousekeepingService;
import de.hbt.pwr.view.service.housekeeping.OldViewProfilesService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Housekeeping of the data of the view-profile service (#242); the edge lets only admins through to {@code /admin}
 */
@RestController
@RequestMapping("/admin/housekeeping")
public class HousekeepingAdminController {

    private final HousekeepingService housekeepingService;
    private final OldViewProfilesService oldViewProfilesService;

    public HousekeepingAdminController(HousekeepingService housekeepingService,
                                       OldViewProfilesService oldViewProfilesService) {
        this.housekeepingService = housekeepingService;
        this.oldViewProfilesService = oldViewProfilesService;
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

    /** Rubric old (#289): view profiles unused for longer than the limit, the latest of each consultant excepted */
    @GetMapping("/old")
    public List<HousekeepingFindings> checkOld() {
        return oldViewProfilesService.check();
    }

    /** Deletes what the check finds now; the answer says how many */
    @DeleteMapping("/old/{check}")
    public HousekeepingFindings cleanOld(@PathVariable("check") String check) {
        return new HousekeepingFindings(check, oldViewProfilesService.clean(check), List.of(), null);
    }
}
