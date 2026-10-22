package de.hbt.pwr.controller;

import de.hbt.pwr.service.AsyncInformationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin functions of the statistics; the edge restricts <code>/admin/**</code> to <code>Power.Admin</code>.
 */
@RestController
@RequestMapping("/admin")
public class StatisticsAdminController {

    private final AsyncInformationService asyncInformationService;

    public StatisticsAdminController(AsyncInformationService asyncInformationService) {
        this.asyncInformationService = asyncInformationService;
    }

    /**
     * Reloads the consultants from the profile service right away instead of with the next hourly refresh, e.g. after
     * the profile service merged skills (#205). Answers when done.
     */
    @PostMapping("/consultants/refresh")
    public ResponseEntity<Void> refreshConsultants() {
        asyncInformationService.refreshConsultantData();
        return ResponseEntity.noContent().build();
    }
}
