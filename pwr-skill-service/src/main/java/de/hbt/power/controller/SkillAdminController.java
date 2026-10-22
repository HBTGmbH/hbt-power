package de.hbt.power.controller;

import de.hbt.power.exception.SkillServiceException;
import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.repo.SkillCategoryRepository;
import de.hbt.power.repo.SkillRepository;
import de.hbt.power.service.SkillSearcherService;
import de.hbt.power.service.SkillService;
import io.swagger.annotations.ApiOperation;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

import static de.hbt.power.exception.SkillServiceException.categoryNotFound;
import static de.hbt.power.exception.SkillServiceException.skillNotFound;
import static de.hbt.power.util.SkillServiceUtil.peek;

/**
 * Changes to the skills of the skill tree: aliases, merging, creating, moving, deleting, localizations, deleting versions,
 * the search index. The edge service only lets admins reach <code>/admin/**</code> (#178).
 */
@RestController
@RequestMapping("/admin/skill")
@CrossOrigin
@Log4j2
public class SkillAdminController {

    private final SkillService skillService;

    private final SkillRepository skillRepository;

    private final SkillCategoryRepository skillCategoryRepository;

    private final SkillSearcherService skillSearcherService;

    @Autowired
    public SkillAdminController(SkillService skillService, SkillRepository skillRepository,
                                SkillCategoryRepository skillCategoryRepository, SkillSearcherService skillSearcherService) {
        this.skillService = skillService;
        this.skillRepository = skillRepository;
        this.skillCategoryRepository = skillCategoryRepository;
        this.skillSearcherService = skillSearcherService;
    }

    private Skill requireSkill(Integer id) {
        return skillRepository.findById(id)
                .orElseThrow(() -> skillNotFound(id));
    }

    private SkillCategory requireSkillCategory(Integer id) {
        return skillCategoryRepository.findById(id)
                .orElseThrow(() -> categoryNotFound(id));
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

    @ApiOperation(value = "Moves a skill to a different category", response = Skill.class)
    @PatchMapping("/{id}/category/{category_id}")
    public ResponseEntity<Skill> moveSkill(@PathVariable("id") Integer skillId, @PathVariable("category_id") Integer newParentId) {
        Skill skill = requireSkill(skillId);
        SkillCategory skillCategory = requireSkillCategory(newParentId);
        log.info("Moving " + skill + " to " + skillCategory);
        skill = skillService.moveSkillToCategory(skill, skillCategory);
        return ResponseEntity.ok(skill);
    }

    @ApiOperation(value = "Rebuilds the lucene index")
    @PostMapping("/lucene/index")
    public void buildIndex() {
        log.info("Rebuilding Lucene index.");
        skillSearcherService.buildSearchIndex();
    }

    @ApiOperation(value = "Creates a new skill in the provided category", response = Skill.class)
    @PostMapping("/category/{categoryId}")
    public ResponseEntity<Skill> createSkillInCategory(@RequestBody Skill skill, @PathVariable("categoryId") Integer categoryId) {
        if (skill.getQualifier() == null || skill.getQualifier().trim().isEmpty()) {
            throw SkillServiceException.validationFailed("skill.qualifier", "Qualifier is empty.");
        }
        SkillCategory skillCategory = requireSkillCategory(categoryId);
        Optional<Skill> concurrent = skillRepository.findOneByQualifier(skill.getQualifier());
        if (concurrent.isPresent()) {
            throw SkillServiceException.skillAlreadyExists(concurrent.get());
        }
        log.info("Creating " + skill + " in " + skillCategory.toString());
        skill.setId(null);
        skillService.createSkillInCategory(skill, skillCategory);
        return ResponseEntity.ok(skill);
    }

    @ApiOperation(value = "Permanently deletes a skill")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable("id") Integer skillId) {
        skillRepository.findById(skillId)
                .map(peek(s -> log.info("Deleting skill " + s)))
                .ifPresent(skillRepository::delete);
        return ResponseEntity.noContent().build();
    }

    @ApiOperation(value = "Adds a locale to the given skill")
    @PostMapping("/{id}/locale/{language}")
    public ResponseEntity<Skill> addLocale(@PathVariable("id") Integer skillId,
                                           @PathVariable("language") String language,
                                           @RequestParam("qualifier") String qualifier) {
        Skill skill = requireSkill(skillId);
        log.info("Adding locale{language='" + language + "', qualifier='" + qualifier + "'} to " + skill.toString());
        skillService.addLocaleToSkill(skill, qualifier, language);
        return ResponseEntity.ok(skill);
    }

    @ApiOperation(value = "Deletes a locale from the given skill")
    @DeleteMapping("/{id}/locale/{language}")
    public ResponseEntity<Skill> deleteLocale(@PathVariable("id") Integer skillId, @PathVariable("language") String language) {
        Skill skill = requireSkill(skillId);
        log.info("Removing locale for language '" + language + "' from " + skill.toString());
        skillService.removeLocaleFromSkill(skill, language);
        return ResponseEntity.ok(skill);
    }

    @ApiOperation(value = "Deletes a version from a skill")
    @DeleteMapping("/{id}/version")
    public ResponseEntity<Void> deleteVersion(@PathVariable("id") Integer skillId, @RequestBody String version) {
        Skill skill = requireSkill(skillId);
        skillService.deleteVersion(skill, version);
        return ResponseEntity.ok().build();
    }
}
