package de.hbt.pwr.controller;

import de.hbt.pwr.model.*;
import de.hbt.pwr.model.clustering.ClusteredNetwork;
import de.hbt.pwr.model.clustering.ConsultantClusteringInfo;
import de.hbt.pwr.model.profile.Consultant;
import de.hbt.pwr.model.profile.NameEntityType;
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
public class ProfileStatisticsController {

    private final StatisticsService statisticsService;


    @Autowired
    public ProfileStatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
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

    @RequestMapping(value = "/network/kmed", produces = "application/json")
    public ResponseEntity<ClusteredNetwork> getClusteredNetwork() {
        return ResponseEntity.ok(statisticsService.getClusteredNetwork());
    }

    @RequestMapping(value = "/network/consultant/{initials}", produces = "application/json")
    public ResponseEntity<ConsultantClusteringInfo> getConsultantClusteringInfo(@PathVariable("initials") String initials){
        return ResponseEntity.ok(statisticsService.getConsultantInfo(initials));
    }

    @GetMapping(value = "/entries/referencing", produces = "application/json")
    public ResponseEntity<List<ConsultantInfo>> getConsultantsReferencingNameEntity(
            @RequestParam(value = "name-entity") String nameEntityName,
            @RequestParam(value = "type") NameEntityType type) {
        List<Consultant> consultantLost = statisticsService.getAllConsultantsReferencingNameEntity(nameEntityName, type);
        return ResponseEntity.ok(consultantLost.stream().map(ConsultantInfo::new).collect(Collectors.toList()));
    }

    @GetMapping(value = "/skill/referencing", produces = "application/json")
    public ResponseEntity<List<ConsultantInfo>> getConsultantsReferencingSkill(
            @RequestParam(value = "skill") String skillName) {
        List<Consultant> consultants = statisticsService.getAllConsultantsReferencingSkill(skillName);
        return ResponseEntity.ok(consultants.stream().map(ConsultantInfo::new).collect(Collectors.toList()));
    }
}
