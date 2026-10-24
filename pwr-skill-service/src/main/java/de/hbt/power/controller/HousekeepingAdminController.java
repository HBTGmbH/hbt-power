package de.hbt.power.controller;

import de.hbt.power.model.HousekeepingFindings;
import de.hbt.power.service.housekeeping.HousekeepingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Housekeeping of the skill tree (#288), rubric <em>unused</em>; the edge lets only admins through to {@code /admin}
 */
@RestController
@RequestMapping("/admin/housekeeping")
public class HousekeepingAdminController {

    private final HousekeepingService housekeepingService;

    public HousekeepingAdminController(HousekeepingService housekeepingService) {
        this.housekeepingService = housekeepingService;
    }

    @GetMapping("/unused")
    public List<HousekeepingFindings> checkUnused() {
        return housekeepingService.checkUnused();
    }

    /** Deletes what the check finds now; the answer says how many */
    @DeleteMapping("/unused/{check}")
    public HousekeepingFindings cleanUnused(@PathVariable("check") String check) {
        return new HousekeepingFindings(check, housekeepingService.cleanUnused(check), List.of(), null);
    }
}
