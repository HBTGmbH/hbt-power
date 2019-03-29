package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.data.NameEntityRepository;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.model.HBTPowerConstants;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.NameEntityType;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Provides suggestions based around {@link NameEntity}.
 * <p>
 * Each endpoint defined here returns a list of all currently existing {@link NameEntity} entities with the
 * given type.
 * </p>
 */
@Controller
@RequestMapping("/suggestions")
public class SuggestionEndpoint {


    private final NameEntityRepository nameEntityRepository;
    private final ProfileRepository profileRepository;

    @Autowired
    public SuggestionEndpoint(NameEntityRepository nameEntityRepository, ProfileRepository profileRepository) {
        this.nameEntityRepository = nameEntityRepository;
        this.profileRepository = profileRepository;
    }


    private ResponseEntity<Collection<NameEntity>> getSuggestionResponse(NameEntityType type) {
        return ResponseEntity.ok(nameEntityRepository.findAllByType(type));
    }

    @GetMapping("/sectors")
    @ApiOperation(value = "Returns possible entities for sectors")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Entities in body", response = List.class)
    })
    public ResponseEntity<Collection<NameEntity>> getSectorSuggestions() {
        return getSuggestionResponse(NameEntityType.SECTOR);
    }

    @GetMapping("/languages")
    @ApiOperation(value = "Returns all currently known languages")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Entities in body", response = List.class)
    })
    public ResponseEntity<Collection<NameEntity>> getLanguageSuggestions() {
        return getSuggestionResponse(NameEntityType.LANGUAGE);
    }

    @GetMapping("/educations")
    @ApiOperation(value = "Returns all currently known educations")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Entities in body", response = List.class)
    })
    public ResponseEntity<Collection<NameEntity>> getEducationSuggestions() {
        return getSuggestionResponse(NameEntityType.EDUCATION);
    }

    @GetMapping("/trainings")
    @ApiOperation(value = "Returns all currently known trainings")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Entities in body", response = List.class)
    })
    public ResponseEntity<Collection<NameEntity>> getTrainingSuggestions() {
        return getSuggestionResponse(NameEntityType.TRAINING);
    }

    @GetMapping("/qualifications")
    @ApiOperation(value = "Returns all currently known qualifications")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Entities in body", response = List.class)
    })
    public ResponseEntity<Collection<NameEntity>> getQualificationSuggestions() {
        return getSuggestionResponse(NameEntityType.QUALIFICATION);
    }

    @GetMapping("/career")
    @ApiOperation(value = "Returns all currently known careers")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Entities in body", response = List.class)
    })
    public ResponseEntity<Collection<NameEntity>> getCareerSuggestions() {
        return getSuggestionResponse(NameEntityType.CAREER);
    }

    @GetMapping("/keyskills")
    @ApiOperation(value = "Returns all currently known careers")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Entities in body", response = List.class)
    })
    public ResponseEntity<Collection<NameEntity>> getKeySkillSuggestions() {
        return getSuggestionResponse(NameEntityType.KEY_SKILL);
    }

    @GetMapping("/companies")
    @ApiOperation(value = "Returns all currently known companies")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Entities in body", response = List.class)
    })
    public ResponseEntity<Collection<NameEntity>> getCompanySuggestions() {
        return getSuggestionResponse(NameEntityType.COMPANY);
    }

    @GetMapping("/projectroles")
    @ApiOperation(value = "Returns all currently known project roles")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Entities in body", response = List.class)
    })
    public ResponseEntity<Collection<NameEntity>> getProjectRoleSuggestions() {
        return getSuggestionResponse(NameEntityType.PROJECT_ROLE);
    }


    @GetMapping("/constants")
    @ApiOperation(value = "Returns API specific constants that limit collection data")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Constants in body", response = HBTPowerConstants.class)
    })
    public ResponseEntity<HBTPowerConstants> getConstants() {
        return ResponseEntity.ok(new HBTPowerConstants());
    }


    /**
     * Returns a list of skill names that are unique per name and only exist in current base profiles,
     * not view profiles.
     *
     * @return
     */
    @GetMapping("/skills")
    public ResponseEntity<List<String>> getAllUniqueSkillNames() {
        List<String> results = profileRepository.findAll()
                .stream()
                .flatMap(profile -> profile.getSkills().stream())
                .map(Skill::getName)
                .collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }

}
