package de.hbt.pwr.controller;

import de.hbt.pwr.model.*;
import de.hbt.pwr.model.clustering.ConsultantClusteringInfo;
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
public class ProfileStatisticsController {

    private final StatisticsService statisticsService;


    @Autowired
    public ProfileStatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @RequestMapping(value = "/ping", produces = "plain/text", method = RequestMethod.GET)
    public ResponseEntity<String> returnPing() {
        return ResponseEntity.ok("UP!");
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

    @RequestMapping(value = "/network/consultant/{initials}", produces = "application/json")
    public ResponseEntity<ConsultantClusteringInfo> getConsultantClusteringInfo(@PathVariable("initials") String initials){
        return ResponseEntity.ok(statisticsService.getConsultantInfo(initials));
    }
}
