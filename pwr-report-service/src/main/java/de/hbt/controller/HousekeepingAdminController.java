package de.hbt.controller;

import de.hbt.model.HousekeepingFindings;
import de.hbt.service.housekeeping.HousekeepingService;
import de.hbt.service.housekeeping.OldReportsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Housekeeping of the data of the report service (#242); the edge lets only admins through to {@code /admin}
 */
@RestController
@RequestMapping("admin/housekeeping")
public class HousekeepingAdminController {

    private final HousekeepingService housekeepingService;
    private final OldReportsService oldReportsService;

    public HousekeepingAdminController(HousekeepingService housekeepingService, OldReportsService oldReportsService) {
        this.housekeepingService = housekeepingService;
        this.oldReportsService = oldReportsService;
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

    /** Rubric old (#289): documents older than the limit, the newest of each consultant excepted */
    @GetMapping("old")
    public List<HousekeepingFindings> checkOld() {
        return oldReportsService.check();
    }

    /** Deletes what the check finds now; the answer says how many */
    @DeleteMapping("old/{check}")
    public HousekeepingFindings cleanOld(@PathVariable("check") String check) {
        return new HousekeepingFindings(check, oldReportsService.clean(check), List.of(), null);
    }
}
