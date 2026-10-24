package de.hbt.pwr.controller;

import de.hbt.pwr.model.ConsultantInfo;
import de.hbt.pwr.model.clustering.ClusteredNetwork;
import de.hbt.pwr.model.profile.Consultant;
import de.hbt.pwr.model.profile.NameEntityType;
import de.hbt.pwr.service.AsyncInformationService;
import de.hbt.pwr.service.StatisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin functions of the statistics; the edge restricts <code>/admin/**</code> to <code>Power.Admin</code>.
 */
@RestController
@RequestMapping("/admin")
public class StatisticsAdminController {

    private final AsyncInformationService asyncInformationService;
    private final StatisticsService statisticsService;

    public StatisticsAdminController(AsyncInformationService asyncInformationService,
                                     StatisticsService statisticsService) {
        this.asyncInformationService = asyncInformationService;
        this.statisticsService = statisticsService;
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

    /**
     * Who uses a profile element or a skill, with personal data; only the admin area asks (#255)
     */
    @GetMapping(value = "/statistics/entries/referencing", produces = "application/json")
    public ResponseEntity<List<ConsultantInfo>> getConsultantsReferencingNameEntity(
            @RequestParam(value = "name-entity") String nameEntityName,
            @RequestParam(value = "type") NameEntityType type) {
        List<Consultant> consultantLost = statisticsService.getAllConsultantsReferencingNameEntity(nameEntityName, type);
        return ResponseEntity.ok(consultantLost.stream().map(ConsultantInfo::new).collect(Collectors.toList()));
    }

    @GetMapping(value = "/statistics/skill/referencing", produces = "application/json")
    public ResponseEntity<List<ConsultantInfo>> getConsultantsReferencingSkill(
            @RequestParam(value = "skill") String skillName) {
        List<Consultant> consultants = statisticsService.getAllConsultantsReferencingSkill(skillName);
        return ResponseEntity.ok(consultants.stream().map(ConsultantInfo::new).collect(Collectors.toList()));
    }

    @RequestMapping(value = "/statistics/network/kmed", produces = "application/json")
    public ResponseEntity<ClusteredNetwork> getClusteredNetwork() {
        return ResponseEntity.ok(statisticsService.getClusteredNetwork());
    }
}
