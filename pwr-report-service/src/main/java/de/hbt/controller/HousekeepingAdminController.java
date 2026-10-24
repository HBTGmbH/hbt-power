package de.hbt.controller;

import de.hbt.model.HousekeepingFindings;
import de.hbt.service.housekeeping.HousekeepingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Housekeeping of the data of the report service (#242); the edge lets only admins through to {@code /admin}
 */
@RestController
@RequestMapping("admin/housekeeping")
public class HousekeepingAdminController {

    private final HousekeepingService housekeepingService;

    public HousekeepingAdminController(HousekeepingService housekeepingService) {
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
