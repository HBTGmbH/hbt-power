package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.model.HousekeepingFindings;
import de.hbt.pwr.profile.service.housekeeping.HousekeepingService;
import de.hbt.pwr.profile.service.housekeeping.UnusedNameEntitiesService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Housekeeping of the data of the profile service (#242); the edge lets only admins through to {@code /admin}
 */
@RestController
@RequestMapping("/admin/housekeeping")
public class HousekeepingAdminEndpoint {

    private final HousekeepingService housekeepingService;
    private final UnusedNameEntitiesService unusedNameEntitiesService;

    public HousekeepingAdminEndpoint(HousekeepingService housekeepingService,
                                     UnusedNameEntitiesService unusedNameEntitiesService) {
        this.housekeepingService = housekeepingService;
        this.unusedNameEntitiesService = unusedNameEntitiesService;
    }

    @GetMapping
    public List<HousekeepingFindings> check() {
        return housekeepingService.check();
    }

    /**
     * Rubric unused (#288): the profile elements no profile uses, per type. Deleting them goes through
     * {@code DELETE /admin/name-entities/unused?type=}, whose dialog lists every name.
     */
    @GetMapping("/unused")
    public List<HousekeepingFindings> checkUnused() {
        return unusedNameEntitiesService.check();
    }

    /** Deletes what the check finds now; the answer says how many */
    @DeleteMapping("{check}")
    public HousekeepingFindings clean(@PathVariable("check") String check) {
        return new HousekeepingFindings(check, housekeepingService.clean(check), List.of(), null);
    }
}
