package de.hbt.power.controller;

import de.hbt.power.exception.SkillServiceException;
import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.repo.SkillCategoryRepository;
import de.hbt.power.repo.SkillRepository;
import de.hbt.power.service.CategoryService;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Log4j2
@RestController()
@RequestMapping("/category")
@CrossOrigin(origins = "*",
        methods = {RequestMethod.PUT, RequestMethod.GET, RequestMethod.PATCH, RequestMethod.POST, RequestMethod.DELETE},
        allowedHeaders = {"origin", "content-type", "accept", "authorization", "X-Requested-With"},
        allowCredentials = "true")
public class CategoryController {
    private final SkillCategoryRepository skillCategoryRepository;
    private final SkillRepository skillRepository;

    private final CategoryService categoryService;


    @Autowired
    CategoryController(SkillCategoryRepository skillCategoryRepository, SkillRepository skillRepository, CategoryService categoryService, SkillRepository skillRepository1, CategoryService categoryService1) {
        this.skillCategoryRepository = skillCategoryRepository;
        this.skillRepository = skillRepository1;
        this.categoryService = categoryService1;
    }

    @RequestMapping(value = "", method = RequestMethod.GET)
    public ResponseEntity<List<Integer>> getAllCategoryIds() {
        final List<Integer> categories = new ArrayList<>();
        skillCategoryRepository.findAll().forEach(c -> categories.add(c.getId()));
        return ResponseEntity.ok(categories);
    }

    /**
     * Returns all root categories -> categories without a parent
     */
    @ApiOperation(value = "Returns all root IDs",
            notes = "Returns all available root categories ids. A root category has no direct parent. It might happen that the" +
                    "returned list is empty, indicating a server or database problem. (The list should not be empty, there are always root categories.)",
            response = Integer.class,
            responseContainer = "List",
            httpMethod = "GET",
            produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Returns the root category ids in response. May be empty.", response = List.class),
    })
    @GetMapping(value = "/root")
    public ResponseEntity<List<Integer>> getRootCategoryIds() {
        final List<Integer> ids = skillCategoryRepository.findAllByCategoryIsNull().stream().map(SkillCategory::getId).collect(Collectors.toList());
        return ResponseEntity.ok(ids);
    }

    @ApiOperation(value = "Returns all child IDs",
            notes = "For a given category ID, returns the IDs of all categories that are direct children to this category.",
            response = Integer.class,
            responseContainer = "List",
            httpMethod = "GET",
            produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Child category IDs returned in response. May be empty."),
            @ApiResponse(code = 404, message = "No category found for the provided ID.")
    })
    @GetMapping(value = "/{id}/children")
    public ResponseEntity<List<Integer>> getChildrenIds(@PathVariable("id") Integer id) {
        SkillCategory skillCategory = getCategory(id);
        final List<Integer> childIds = skillCategoryRepository.findAllByCategory(skillCategory).stream()
                .map(SkillCategory::getId)
                .collect(Collectors.toList());
        return ResponseEntity.ok(childIds);
    }

    @ApiOperation(value = "Returns all child Skills",
            notes = "For a given category ID, returns all skills that are direct children to that category.",
            response = Skill.class,
            responseContainer = "List",
            httpMethod = "GET",
            produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Child Skills returned in response. May be empty.")
    })
    @GetMapping(value = "/{id}/skills")
    public ResponseEntity<List<Skill>> getChildSkills(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(skillRepository.findAllByCategory_Id(id));
    }


    @ApiOperation(value = "Returns a category",
            notes = "Returns the category identified by the given ID.",
            response = SkillCategory.class,
            httpMethod = "GET",
            produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Category found and returned in response."),
            @ApiResponse(code = 404, message = "No category found for the provided ID.")
    })
    @GetMapping(value = "/{id}")
    public ResponseEntity<SkillCategory> getCategoryById(@PathVariable Integer id) {
        SkillCategory category = getCategory(id);
        return ResponseEntity.ok(category);
    }

    @ApiOperation(value = "Returns a category",
            notes = "Returns the category identifies by its unique qualifier",
            response = SkillCategory.class,
            httpMethod = "GET",
            produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Category found and returned in response."),
            @ApiResponse(code = 204, message = "No category found for the provided qualifier.")
    })
    @GetMapping(value = "/byName")
    public ResponseEntity<SkillCategory> getCategoryByQualifier(@RequestParam("qualifier") String qualifier) {
        return skillCategoryRepository.findOneByQualifier(qualifier)
                .map(ResponseEntity::ok)
                .orElseGet(ResponseEntity.noContent()::build);
    }


    @ApiOperation(value = "Creates a custom category.",
            notes = "Creates a custom category that is direct child to the category identified by 'parent_id'. <br/>" +
                    "A custom category is a category that has been manually created via this endpoint and was not created by the" +
                    "services logic, and is thus not present in the external skill source." +
                    "<br/><br/>The category that is going" +
                    "to be created must be present in the body and it's ID must be null.<br/> Furthermore, the qualifier for the" +
                    "new category must be unique and neither null nor empty.",
            response = SkillCategory.class,
            httpMethod = "POST",
            produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Category successfully created and returned in response."),
            @ApiResponse(code = 400, message = "Invalid category provided in body."),
            @ApiResponse(code = 404, message = "No category for provided parent id found."),
            @ApiResponse(code = 409, message = "A category with the same qualifier already exists.")
    })
    @PostMapping(value = "/{parent_id}")
    @Transactional
    public ResponseEntity<SkillCategory> createCategory(@RequestBody() SkillCategory category,
                                                        @PathVariable(value = "parent_id", required = false) Integer parentId) {
        return ResponseEntity.ok(categoryService.createSkillCategory(category, parentId));
    }

    @ApiOperation(value = "Deletes a custom category.",
            notes = "Deletes a category if it was created manually by this API and not by the services business logic.",
            httpMethod = "DELETE",
            produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Category successfully deleted."),
            @ApiResponse(code = 400, message = "The category to be deleted was not custom."),
            @ApiResponse(code = 404, message = "No category for provided id found."),
    })
    @DeleteMapping(value = "/{id}")
    @Transactional
    public ResponseEntity deleteCategory(@PathVariable("id") Integer categoryId) {
        SkillCategory skillCategory = getCategory(categoryId);

        log.info("Deleting the " + skillCategory.toString());
        categoryService.deleteCategory(skillCategory);
        return ResponseEntity.noContent().build();
    }

    @ApiOperation(value = "Sets the display status",
            notes = "Defines the display status of the provided category. <br/>" +
                    "A display category is a catgory which is intended to be displayed in the document generated by the pwr-report-service. " +
                    "In this document, only one category for each skill is shown. The display flag in this service defines that the " +
                    "category is suited for display.",
            response = SkillCategory.class,
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Display flag set and category returned."),
            @ApiResponse(code = 404, message = "No category for provided id found."),
    })
    @PatchMapping("/{id}/display/{isDisplay}")
    @Transactional
    public ResponseEntity<SkillCategory> setDisplay(@PathVariable("id") Integer categoryId,
                                                    @PathVariable("isDisplay") boolean isDisplay) {
        SkillCategory skillCategory = getCategory(categoryId);
        categoryService.setIsDisplay(skillCategory, isDisplay);
        return ResponseEntity.ok(skillCategory);
    }

    @ApiOperation(value = "Adds a category locale",
            notes = "Adds a localization to the category idetified by the provided ID. <br/>" +
                    "Localizations allow flexible usage of the external skill service. The qualifiers provided by this" +
                    "service are supposed to be treated like technical IDs, which are sometimes not suitable for display." +
                    "To work around this problem, locales can be added to a category. <br/>" +
                    "The provided language must be a valid ISO639_2 2 digit language code.",
            response = SkillCategory.class,
            httpMethod = "POST",
            produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Locale added and updated category returned in response."),
            @ApiResponse(code = 400, message = "Locale is not a valid ISO639_2 language."),
            @ApiResponse(code = 404, message = "No category for provided id found."),
    })
    @PostMapping(value = "/{id}/locale")
    public ResponseEntity<SkillCategory> addLocalizationToCategory(
            @PathVariable("id") Integer categoryId,
            @RequestParam("lang") String language,
            @RequestParam("qualifier") String qualifier) {

        SkillCategory category = getCategory(categoryId);
        log.info("Adding the localization{lang ='" + language + "', qualifier='" + qualifier + "'} to " + category.toString());
        category = categoryService.addLocalizationToCategory(category, language, qualifier);
        return ResponseEntity.ok(category);
    }

    @ApiOperation(value = "Removes a category locale",
            notes = "Removes a category locale. If the locale did not exist in the first place, nothing changes.<br/>" +
                    "The provided language must be a valid ISO639_2 2 digit language code.",
            response = SkillCategory.class,
            httpMethod = "DELETE",
            produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Locale removed and updated category returned in response."),
            @ApiResponse(code = 400, message = "Locale is not a valid ISO639_2 language."),
            @ApiResponse(code = 404, message = "No category for provided id found."),
    })
    @DeleteMapping(value = "/{id}/locale/{language}")
    public ResponseEntity<SkillCategory> deleteLocalizationFromCategory(
            @PathVariable("id") Integer categoryId,
            @PathVariable("language") String language
    ) {
        SkillCategory category = getCategory(categoryId);
        log.info("Removing the localization for lang='" + language + "' from " + category.toString());
        return ResponseEntity.ok(categoryService.removeLocalizationToCategory(category, language));
    }

    @ApiOperation(value = "Moves a custom category",
            notes = "Moves a custom category to a different parent category.",
            response = SkillCategory.class,
            httpMethod = "PATCH",
            produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Category successfully moved and returned in response."),
            @ApiResponse(code = 404, message = "No category for provided <code>categoryId</code> or <code>parent_id</code> found"),
    })
    @PatchMapping(value = "/{id}/category/{parent_id}")
    public ResponseEntity<SkillCategory> moveCategory(@PathVariable("id") Integer categoryId, @PathVariable("parent_id") Integer newParentId) {
        SkillCategory toMove = getCategory(categoryId);
        SkillCategory newParent = getCategory(newParentId);
        log.info("Moving category " + toMove.toString() + " to " + newParent.toString());
        return ResponseEntity.ok(categoryService.moveCategory(toMove, newParent));
    }

    /**
     * Adds the category identified by the given <code>id</code> to the list of blacklisted categories.
     * All child-categories will also be blacklisted.
     *
     * @param categoryId id
     * @return the category that was blacklisted.
     */
    @ApiOperation(value = "Blacklists a category",
            notes = "Moves an arbitrary category into the blacklist. Blacklisted categories indicates categories that" +
                    " are not supposed to be used, but are kept due to consistency regulations.",
            response = SkillCategory.class,
            httpMethod = "POST",
            produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Category successfully blacklisted and returned in response."),
            @ApiResponse(code = 404, message = "No category for provided <code>id</code> found"),
    })
    @PostMapping(value = "/blacklist/{id}")
    @Transactional
    public ResponseEntity<SkillCategory> addToBlacklist(@PathVariable("id") Integer categoryId) {
        SkillCategory skillCategory = getCategory(categoryId);
        log.info("Blacklisting the category " + skillCategory.toString() + " and all child categories.");
        categoryService.blacklist(skillCategory);
        return ResponseEntity.ok(skillCategory);
    }


    /**
     * Removes the category and all its child categories from the blacklist.
     *
     * @param categoryId id
     * @return the category that was removed from the blacklist
     */
    @ApiOperation(value = "Removes a category from the blacklist",
            notes = "Removes an arbitrary category into the blacklist. Blacklisted categories indicates categories that" +
                    " are not supposed to be used, but are kept due to consistency regulations.",
            response = SkillCategory.class,
            httpMethod = "DELETE",
            produces = "application/json")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Category successfully blacklisted and returned in response."),
            @ApiResponse(code = 404, message = "No category for provided <code>id</code> found"),
    })
    @DeleteMapping(value = "/blacklist/{id}")
    @Transactional
    public ResponseEntity<SkillCategory> deleteFromBlackList(@PathVariable("id") Integer categoryId) {
        SkillCategory skillCategory = getCategory(categoryId);
        log.info("Whitelisting the category " + skillCategory.toString() + " and all child categories.");
        categoryService.whitelist(skillCategory);
        return ResponseEntity.ok(skillCategory);
    }


    @GetMapping(value = "/blacklist")
    public ResponseEntity<List<Integer>> getAllBlacklistedCategoryIds() {
        List<SkillCategory> blacklisted = skillCategoryRepository.findAllByBlacklistedTrue();
        List<Integer> ids = blacklisted.stream().map(SkillCategory::getId).collect(Collectors.toList());
        return ResponseEntity.ok(ids);
    }

    private SkillCategory getCategory(Integer categoryId) {
        return skillCategoryRepository.findById(categoryId)
                .orElseThrow(() -> SkillServiceException.categoryNotFound(categoryId));
    }
}
