package de.hbt.power.controller;

import de.hbt.power.model.Skill;
import de.hbt.power.service.SkillService;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Maintenance of aliases and merging of skills. The edge service only lets admins reach <code>/admin/**</code>.
 */
@RestController
@RequestMapping("/admin/skill")
@CrossOrigin
public class SkillAdminController {

    private final SkillService skillService;

    @Autowired
    public SkillAdminController(SkillService skillService) {
        this.skillService = skillService;
    }

    @ApiOperation(value = "Adds an alias to a skill; 409 if it is the name or an alias of another skill", response = Skill.class)
    @PostMapping("/{id}/alias")
    public ResponseEntity<Skill> addAlias(@PathVariable("id") Integer skillId, @RequestParam("alias") String alias) {
        return ResponseEntity.ok(skillService.addAlias(skillId, alias));
    }

    @ApiOperation(value = "Removes an alias from a skill", response = Skill.class)
    @DeleteMapping("/{id}/alias")
    public ResponseEntity<Skill> removeAlias(@PathVariable("id") Integer skillId, @RequestParam("alias") String alias) {
        return ResponseEntity.ok(skillService.removeAlias(skillId, alias));
    }

    @ApiOperation(value = "Merges skill 'source' into skill 'target': the source becomes an alias of the target",
            notes = "Name and aliases of the source become aliases of the target, the versions are united and the source " +
                    "is deleted. A source that is no skill becomes an alias of the target. Idempotent.",
            response = Skill.class)
    @PostMapping("/merge")
    public ResponseEntity<Skill> mergeSkills(@RequestParam("source") String source, @RequestParam("target") String target) {
        return ResponseEntity.ok(skillService.mergeSkills(source, target));
    }
}
