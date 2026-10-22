package de.hbt.power.controller;

import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.model.dto.LocalizationLanguage;
import de.hbt.power.model.dto.SkillSuggestion;
import de.hbt.power.model.dto.TCategoryNode;
import de.hbt.power.repo.SkillRepository;
import de.hbt.power.service.CategoryService;
import de.hbt.power.service.LocalizationService;
import de.hbt.power.service.SkillSearcherService;
import de.hbt.power.service.SkillService;
import de.hbt.power.service.SkillTreeMappingService;
import io.swagger.annotations.ApiOperation;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

import static de.hbt.power.exception.SkillServiceException.skillNotFound;


/**
 * Reading the skill tree, plus what a consultant does while editing a profile: putting a new skill into "Other" and adding
 * a version. Everything else that changes the tree is in {@link SkillAdminController} (#178).
 */
@RestController()
@RequestMapping("/skill")
@CrossOrigin
@Log4j2
public class SkillController {

    private static final Integer DEFAULT_MAX_RESULTS = 20;

    private final SkillRepository skillRepository;

    private final SkillSearcherService skillSearcherService;

    private final SkillService skillService;

    private final CategoryService categoryService;

    private final SkillTreeMappingService skillTreeMappingService;

    private final LocalizationService localizationService;

    @Autowired
    public SkillController(
            SkillRepository skillRepository,
            SkillSearcherService skillSearcherService, SkillService skillService, CategoryService categoryService, SkillTreeMappingService skillTreeMappingService,
            LocalizationService localizationService) {
        this.skillRepository = skillRepository;
        this.skillSearcherService = skillSearcherService;
        this.skillService = skillService;
        this.categoryService = categoryService;
        this.skillTreeMappingService = skillTreeMappingService;
        this.localizationService = localizationService;
    }

    private Skill requireSkill(Integer id) {
        return skillRepository.findById(id)
                .orElseThrow(() -> skillNotFound(id));
    }

    @ApiOperation(value = "Returns a skill by ID", response = Skill.class)
    @GetMapping("/{skillId}")
    public ResponseEntity<Skill> getSkill(@PathVariable Integer skillId) {
        return ResponseEntity.ok(requireSkill(skillId));
    }


    @ApiOperation(value = "Searches and returns a skill by qualifier or alias", response = Skill.class)
    @GetMapping("/byName")
    public ResponseEntity<Skill> findSkillByQualifier(@RequestParam("qualifier") String qualifier) {
        return skillService.findByNameOrAlias(qualifier)
                .map((skill) -> {
                    // Trick/Hack: ensure parent categories are loaded by hibernate (lazy) - kr
                    SkillCategory cat = skill.getCategory();
                    while (cat != null && cat.getCategory() != null) {
                        cat = cat.getCategory();
                    }
                    return skill;
                })
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build()); // TODO find by localized qualifieres
    }


    @ApiOperation(value = "Fuzzy search for skill names", response = String.class, responseContainer = "List")
    @GetMapping(value = "/search")
    public ResponseEntity<List<String>> searchSkill(@RequestParam("searchterm") String searchTerm, @RequestParam Integer maxResults) {
        if (maxResults == null) {
            maxResults = DEFAULT_MAX_RESULTS;
        }
        List<String> suggestions = skillSearcherService.searchSkill(searchTerm, maxResults);
        return ResponseEntity.ok(suggestions);
    }


    @ApiOperation(value = "Fuzzy search for skills: name plus the alias that matched, if one matched better than the name",
            response = SkillSuggestion.class, responseContainer = "List")
    @GetMapping(value = "/suggestions")
    public ResponseEntity<List<SkillSuggestion>> suggestSkills(@RequestParam("searchterm") String searchTerm,
                                                               @RequestParam(required = false) Integer maxResults) {
        return ResponseEntity.ok(skillSearcherService.suggestSkills(searchTerm, maxResults == null ? DEFAULT_MAX_RESULTS : maxResults));
    }


    /**
     * Returns the category for the requested SkillId, categorizes the Skill if no SkillCategory was set before.
     *
     * @return updated SkillCategory
     */
    @ApiOperation(value = "Updates the category of the given skill. If no skill was found, the skill is created", response = SkillCategory.class)
    @PostMapping
    public ResponseEntity<SkillCategory> updateAndGetCategory(@RequestParam("qualifier") String qualifier) {
        Skill skill = skillService.findByNameOrAlias(qualifier)
                .orElseGet(() -> {
                    Skill toCreate = Skill.of(qualifier);
                    return skillService.createSkillInCategory(toCreate, categoryService.getOther());
                });
        if (skill.getCategory() == null) {
            log.info("Categorizing " + skill + " as 'Other'");
            skill.setCategory(categoryService.getOther());
            skill = skillRepository.save(skill);
        }
        return ResponseEntity.ok(skill.getCategory());
    }


    @ApiOperation(value = "Adds a version to a skill")
    @PostMapping("{id}/version")
    public ResponseEntity<Set<String>> addVersion(@PathVariable("id") Integer skillId, @RequestBody String version) {
        Skill skill = requireSkill(skillId);
        skillService.addVersion(skill, version);
        return ResponseEntity.ok(skill.getVersions());
    }

    @ApiOperation(value = "Returns the languages with localizations of skills or categories (ISO 639-2 code and German name)")
    @GetMapping("/locales")
    public ResponseEntity<List<LocalizationLanguage>> getLocalizationLanguages() {
        return ResponseEntity.ok(localizationService.getLanguages());
    }

    @ApiOperation(value = "Returns a model of the skill tree. Returned value is the root node.", response = TCategoryNode.class)
    @GetMapping("/tree")
    public ResponseEntity<TCategoryNode> getTree() {
        return ResponseEntity.ok(skillTreeMappingService.buildSkillTree());
    }
}
