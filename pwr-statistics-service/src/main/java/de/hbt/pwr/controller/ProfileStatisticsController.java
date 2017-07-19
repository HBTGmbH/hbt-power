package de.hbt.pwr.controller;

import de.hbt.pwr.model.*;
import de.hbt.pwr.model.clustering.ClusteredNetwork;
import de.hbt.pwr.model.clustering.ConsultantClusteringInfo;
import de.hbt.pwr.model.clustering.MetricType;
import de.hbt.pwr.model.profile.Consultant;
import de.hbt.pwr.model.profile.NameEntity;
import de.hbt.pwr.model.profile.NameEntityType;
import de.hbt.pwr.service.AsyncInformationService;
import de.hbt.pwr.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpServerErrorException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static de.hbt.pwr.model.StatisticsConfig.DEFAULT_MAX_SKILLS;

@Controller
@RequestMapping("/statistics")
@CrossOrigin(origins = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.HEAD},
        allowedHeaders = {"origin", "content-type", "accept", "authorization", "X-Requested-With"},
        allowCredentials = "true")
public class ProfileStatisticsController {

    private final StatisticsService statisticsService;

    private final AsyncInformationService asyncInformationService;


    @Autowired
    public ProfileStatisticsController(StatisticsService statisticsService, AsyncInformationService asyncInformationService) {
        this.statisticsService = statisticsService;
        this.asyncInformationService = asyncInformationService;
    }

    @RequestMapping(value = "", method = RequestMethod.HEAD)
    public ResponseEntity available() {
        return ResponseEntity.noContent().build();
    }

    @RequestMapping(value = "", method = RequestMethod.POST)
    public ResponseEntity refresh() {
        asyncInformationService.invokeConsultantDataRefresh();
        return ResponseEntity.noContent().build();
    }

    @RequestMapping(value = "/skill/usage/absolute", produces = "application/json")
    public ResponseEntity<List<SkillUsage>> getMostUsedSkills(@RequestParam(value = "max", required = false) Integer maxSkills) {
        if(maxSkills == null) maxSkills = DEFAULT_MAX_SKILLS;
        if(maxSkills <= 0) throw new HttpServerErrorException(HttpStatus.BAD_REQUEST, "Parameter 'max' must not be negative.");
        return ResponseEntity.ok(statisticsService.getMostUsedSkills(maxSkills));
    }

    @RequestMapping(value = "/consultant/find/skills", produces = "application/json", consumes = "application/json", method = RequestMethod.POST)
    public ResponseEntity<List<ConsultantSkillInfo>> findConsultantsBySkills(@RequestBody List<String> skillNames) {
        return ResponseEntity.ok(statisticsService.findConsultantsBySkills(skillNames));
    }


    @RequestMapping(value = "/skill/usage/relative", produces = "application/json")
    public ResponseEntity<List<RelativeSkillUsage>> getRelativeMostUsedSkills(Integer maxSkills) {
        if(maxSkills == null) maxSkills = DEFAULT_MAX_SKILLS;
        if(maxSkills <= 0) throw new HttpServerErrorException(HttpStatus.BAD_REQUEST, "Parameter 'max' must not be negative.");
        return ResponseEntity.ok(statisticsService.getRelativeMostUsedSkills(maxSkills));
    }

    @RequestMapping(value = "/skill/common", produces = "application/json")
    public ResponseEntity<List<String>> getCommonSkills() {
        return ResponseEntity.ok(statisticsService.getCommonSkills());
    }

    @RequestMapping(value = "/skill/common/{initials}", produces = "application/json")
    public ResponseEntity<Map<String, List<String>>> getProfileSkillMetrics(@PathVariable("initials") String initials) {
        List<String> common = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        statisticsService.getCommonProfileSkills(common, missing, initials);
        Map<String, List<String>> result = new HashMap<>();
        result.put("missing", missing);
        result.put("common", common);
        return ResponseEntity.ok(result);
    }

    @RequestMapping(value = "/skill/level", produces = "application/json")
    public ResponseEntity<List<SkillAverageRating>> getSkillLevelMetric() {
        return ResponseEntity.ok(statisticsService.calculateRatedSkillFrequency());
    }

    @RequestMapping(value = "/network/kmed", produces = "application/json")
    public ResponseEntity<ClusteredNetwork> getClusteredNetwork() {
        return ResponseEntity.ok(statisticsService.getClusteredNetwork());
    }

    /**
     * Updates the parameters for the clustering process that is automated and invokes a re-clustering
     * @param iterations the amount of iterations used for the k-medoid algorithm
     * @param clusters the amount of expected clusters
     * @param metric type to be used
     * @return the newly clustered network.
     */
    @RequestMapping(value = "/network/kmed", produces = "application/json", method = RequestMethod.POST)
    public ResponseEntity<ClusteredNetwork> updateClusteredNetworkParams(
            @RequestParam(value = "iterations", required = true) Integer iterations,
            @RequestParam(value = "clusters", required = true) Integer clusters,
            @RequestParam(value = "metric", required = true) MetricType metric
    ) {
        statisticsService.updateConfigAndRenewNetwork(iterations, clusters, metric);
        return ResponseEntity.ok(statisticsService.getClusteredNetwork());
    }

    @RequestMapping(value = "/network/consultant/{initials}", produces = "application/json")
    public ResponseEntity<ConsultantClusteringInfo> getConsultantClusteringInfo(@PathVariable("initials") String initials){
        return ResponseEntity.ok(statisticsService.getConsultantInfo(initials));
    }

    @GetMapping(value = "/entries/referencing", produces = "application/json")
    public ResponseEntity<List<ConsultantInfo>> getConsultantsReferencingNameEntity(
            @RequestParam(value = "name-entity", required = true) String nameEntityName,
            @RequestParam(value = "type", required = true) NameEntityType type) {
        List<Consultant> consultantLost = statisticsService.getAllConsultantsReferencingNameEntity(nameEntityName, type);
        return ResponseEntity.ok(consultantLost.stream().map(ConsultantInfo::new).collect(Collectors.toList()));
    }

    @GetMapping(value = "/skill/referencing", produces = "application/json")
    public ResponseEntity<List<ConsultantInfo>> getConsultantsReferencingSkill(
            @RequestParam(value = "skill", required = true) String skillName) {
        List<Consultant> consultants = statisticsService.getAllConsultantsReferencingSkill(skillName);
        return ResponseEntity.ok(consultants.stream().map(ConsultantInfo::new).collect(Collectors.toList()));
    }
}
