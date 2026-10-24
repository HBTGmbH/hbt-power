package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.model.FormerNameDTO;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.service.NameEntityAdminService;
import de.hbt.pwr.profile.service.NameEntityLocalizationService;
import de.hbt.pwr.profile.model.NameEntityLocalizationDTO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static org.springframework.http.ResponseEntity.noContent;

/**
 * Renaming, merging and deleting profile elements in all profiles (#227). Under /admin, which the edge restricts to
 * Power.Admin.
 */
@RestController
@RequestMapping(value = "/admin/name-entities", produces = "application/json")
@Api(value = "Admin resource for profile elements", produces = "application/json")
public class NameEntityAdminEndpoint {

    private final NameEntityAdminService nameEntityAdminService;
    private final NameEntityLocalizationService localizationService;

    public NameEntityAdminEndpoint(NameEntityAdminService nameEntityAdminService,
                                   NameEntityLocalizationService localizationService) {
        this.nameEntityAdminService = nameEntityAdminService;
        this.localizationService = localizationService;
    }

    /**
     * The localizations of the element (#291)
     */
    @GetMapping("/{id}/localizations")
    public List<NameEntityLocalizationDTO> findLocalizations(@PathVariable("id") Long id) {
        return localizationService.findLocalizations(id);
    }

    @ApiOperation(value = "Sets the name of the profile element in a language",
            notes = "One per language (ISO 639-2), replacing the one there was (#291); the localizations afterwards")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "No ISO 639-2 language or a blank name"),
            @ApiResponse(code = 404, message = "No such element")
    })
    @PutMapping("/{id}/localizations/{language}")
    public List<NameEntityLocalizationDTO> setLocalization(@PathVariable("id") Long id,
                                                           @PathVariable("language") String language,
                                                           @RequestParam("qualifier") String qualifier) {
        return localizationService.setLocalization(id, language, qualifier);
    }

    @DeleteMapping("/{id}/localizations/{language}")
    public List<NameEntityLocalizationDTO> deleteLocalization(@PathVariable("id") Long id,
                                                              @PathVariable("language") String language) {
        return localizationService.deleteLocalization(id, language);
    }

    @ApiOperation(value = "All profile elements with a localization in the language (#291), for the view-profile service")
    @GetMapping("/localizations")
    public List<NameEntityLocalizationDTO> findAllInLanguage(@RequestParam("language") String language) {
        return localizationService.findAllInLanguage(language);
    }

    /**
     * How many consultants use each element of the type, by id (#271)
     */
    @GetMapping("/usage")
    public Map<Long, Integer> countUsers(@RequestParam("type") NameEntityType type) {
        return nameEntityAdminService.countUsers(type);
    }

    /**
     * The aliases of the element, its former names included (#270)
     */
    @GetMapping("/{id}/aliases")
    public List<String> findAliases(@PathVariable("id") Long id) {
        return nameEntityAdminService.findAliases(id);
    }

    @ApiOperation(value = "Adds an alias to the profile element",
            notes = "Another name that stands for the element (#270); the aliases afterwards")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The alias is blank"),
            @ApiResponse(code = 404, message = "No such element"),
            @ApiResponse(code = 409, message = "The name of another element of the type or an alias of one")
    })
    @PostMapping("/{id}/aliases")
    public List<String> addAlias(@PathVariable("id") Long id, @RequestParam("alias") String alias) {
        return nameEntityAdminService.addAlias(id, alias);
    }

    /**
     * Removes an alias; the aliases afterwards (#270)
     */
    @DeleteMapping("/{id}/aliases")
    public List<String> deleteAlias(@PathVariable("id") Long id, @RequestParam("alias") String alias) {
        return nameEntityAdminService.deleteAlias(id, alias);
    }

    @ApiOperation(value = "The initials of the consultants whose profile uses the profile element, counted in the database")
    @GetMapping("/{id}/users")
    public List<String> findUsers(@PathVariable("id") Long id) {
        return nameEntityAdminService.findUsers(id);
    }

    @ApiOperation(value = "The profile elements of the type that no profile uses")
    @GetMapping("/unused")
    public List<NameEntity> findUnused(@RequestParam("type") NameEntityType type) {
        return nameEntityAdminService.findUnused(type);
    }

    @ApiOperation(value = "Former names of renamed and merged profile elements with their current names (#230)")
    @GetMapping("/former-names")
    public List<FormerNameDTO> findFormerNames() {
        return nameEntityAdminService.findFormerNames();
    }

    @ApiOperation(value = "Renames a profile element in all profiles",
            notes = "The old name becomes a former name. 409 if another element of the type has the name, ignoring case.")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Renamed", response = NameEntity.class),
            @ApiResponse(code = 400, message = "No name"),
            @ApiResponse(code = 404, message = "No such profile element"),
            @ApiResponse(code = 409, message = "Another profile element of the type has the name")
    })
    @PatchMapping("/{id}")
    public NameEntity rename(@PathVariable("id") Long id, @RequestParam("name") String name) {
        return nameEntityAdminService.rename(id, name);
    }

    @ApiOperation(value = "Merges a profile element into another one of the same type in all profiles",
            notes = "Everything that pointed to the source points to the target, the source is deleted.")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Merged, the target in the response", response = NameEntity.class),
            @ApiResponse(code = 400, message = "Source and target are the same or of different types"),
            @ApiResponse(code = 404, message = "No such profile element")
    })
    @PostMapping("/{id}/merge")
    public NameEntity merge(@PathVariable("id") Long id, @RequestParam("target") Long targetId) {
        return nameEntityAdminService.merge(id, targetId);
    }

    @ApiOperation(value = "Deletes a profile element from all profiles",
            notes = "Profile entries with it are deleted, broker, client and role of projects become empty.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        nameEntityAdminService.delete(id);
        return noContent().build();
    }

    @ApiOperation(value = "Deletes the profile elements of the type that no profile uses, checked again at once")
    @DeleteMapping("/unused")
    public List<NameEntity> deleteUnused(@RequestParam("type") NameEntityType type) {
        return nameEntityAdminService.deleteUnused(type);
    }
}
