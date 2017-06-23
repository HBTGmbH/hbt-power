package de.hbt.pwr.controller;

import de.hbt.pwr.model.RelativeSkillUsage;
import de.hbt.pwr.model.SimRank.ProfileSkillNetwork;
import de.hbt.pwr.model.SkillUsage;
import de.hbt.pwr.model.clustering.ClusteredNetwork;
import de.hbt.pwr.model.clustering.ConsultantClusteringInfo;
import de.hbt.pwr.model.clustering.MetricType;
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

import static de.hbt.pwr.model.StatisticsConfig.DEFAULT_MAX_SKILLS;

@Controller
@RequestMapping("/statistics")
@CrossOrigin(origins = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.HEAD},
        allowedHeaders = {"origin", "content-type", "accept", "authorization", "X-Requested-With"},
        allowCredentials = "true")
public class ProfileStatisticsController {

    private final StatisticsService statisticsService;



    @Autowired
    public ProfileStatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @RequestMapping(value = "", method = RequestMethod.HEAD)
    public ResponseEntity available() {
        return ResponseEntity.noContent().build();
    }

    @RequestMapping(value = "/skill/usage/absolute", produces = "application/json")
    public ResponseEntity<List<SkillUsage>> getMostUsedSkills(@RequestParam(value = "max", required = false) Integer maxSkills) {
        if(maxSkills == null) maxSkills = DEFAULT_MAX_SKILLS;
        if(maxSkills <= 0) throw new HttpServerErrorException(HttpStatus.BAD_REQUEST, "Parameter 'max' must not be negative.");
        return ResponseEntity.ok(statisticsService.getMostUsedSkills(maxSkills));

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

    @RequestMapping(value = "/network/kmed", produces = "application/json")
    public ResponseEntity<ClusteredNetwork> getClusteredNetwork() {
        return ResponseEntity.ok(statisticsService.getClusteredNetwork());
    }

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

}
