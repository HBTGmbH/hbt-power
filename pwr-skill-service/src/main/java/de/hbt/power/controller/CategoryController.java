package de.hbt.power.controller;

import de.hbt.power.exception.SkillServiceException;
import de.hbt.power.model.SkillCategory;
import de.hbt.power.repo.SkillCategoryRepository;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


/**
 * Reading the categories of the skill tree; changes are in {@link CategoryAdminController} (#178).
 */
@RestController()
@RequestMapping("/category")
@CrossOrigin(origins = "*",
        methods = {RequestMethod.PUT, RequestMethod.GET, RequestMethod.PATCH, RequestMethod.POST, RequestMethod.DELETE},
        allowedHeaders = {"origin", "content-type", "accept", "authorization", "X-Requested-With"},
        allowCredentials = "true")
public class CategoryController {
    private final SkillCategoryRepository skillCategoryRepository;

    @Autowired
    CategoryController(SkillCategoryRepository skillCategoryRepository) {
        this.skillCategoryRepository = skillCategoryRepository;
    }

    @RequestMapping(value = "", method = RequestMethod.GET)
    public ResponseEntity<List<Integer>> getAllCategoryIds() {
        final List<Integer> categories = new ArrayList<>();
        skillCategoryRepository.findAll().forEach(c -> categories.add(c.getId()));
        return ResponseEntity.ok(categories);
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


    private SkillCategory getCategory(Integer categoryId) {
        return skillCategoryRepository.findById(categoryId)
                .orElseThrow(() -> SkillServiceException.categoryNotFound(categoryId));
    }
}
