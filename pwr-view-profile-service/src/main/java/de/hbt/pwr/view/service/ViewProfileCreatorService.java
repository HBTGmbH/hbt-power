package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.client.profile.model.*;
import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.exception.NoProfileAvailableException;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.ViewProfileInfo;
import de.hbt.pwr.view.model.entries.Project;
import de.hbt.pwr.view.model.entries.ProjectRole;
import de.hbt.pwr.view.model.entries.sort.NameComparableEntryType;
import de.hbt.pwr.view.model.entries.sort.StartEndDateComparableEntryType;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.model.skill.SkillVersion;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import de.hbt.pwr.view.util.ModelConvertUtil;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static de.hbt.pwr.view.client.skill.model.SkillServiceCategory.other;

@Service
@RequiredArgsConstructor
public class ViewProfileCreatorService {

    public static final String DEFAULT_LOCALE = "deu";
    public static final String PWR_ROOT_NAME = "root";


    private static final Logger LOG = LogManager.getLogger(ViewProfileCreatorService.class);

    private final ProfileServiceClient profileServiceClient;
    private final SkillServiceClient skillServiceClient;
    private final ViewProfileRepository viewProfileRepository;
    private final ViewProfileSortService viewProfileSortService;
    private final ViewProfileLocalizationService viewProfileLocalizationService;

    /**
     * A display category needs at least this many skills of the profile, otherwise they move up (#169)
     */
    @Setter
    @Value("${view-profile.min-skills-per-category:3}")
    private int minSkillsPerCategory = 3;

    public ViewProfile createViewProfile(String initials, String name, String viewDescription, String localeStr) {
        return createViewProfile(initials, name, viewDescription, localeStr, null);
    }

    /**
     * @param localization ISO 639-2 code of the language of the skill and category names (#174), null for the names
     *                     of the skill tree
     */
    public ViewProfile createViewProfile(String initials, String name, String viewDescription, String localeStr,
                                         String localization) {
        Locale locale = (localeStr == null || localeStr.equals("")) ? Locale.GERMAN : Locale.forLanguageTag(localeStr);

        Profile profile;
        try {
            profile = profileServiceClient.getSingleProfile(initials);
        } catch (RuntimeException e) {
            LOG.error("Could not get profile from client for " + initials, e);
            // A RestClientException from the RestTemplate, or the profile service answering with an error
            throw new NoProfileAvailableException(initials);
        }
        return createViewProfile(profile, initials, name, viewDescription, locale, localization);
    }


    private ViewProfile createViewProfile(Profile profile, String initials, String name, String viewDescription, Locale locale,
                                          String localization) {

        ViewProfile result = new ViewProfile();
        result.setLocale(locale);

        result.setViewProfileInfo(createInfo(initials, name, viewDescription));
        result.setDescription(profile.getDescription());
        result.setLanguages(profile.getLanguages().stream().map(ModelConvertUtil::mapLanguage).collect(Collectors.toList()));
        result.setQualifications(profile.getQualification().stream().map(ModelConvertUtil::mapQualification).collect(Collectors.toList()));
        result.setTrainings(profile.getTrainingEntries().stream().map(ModelConvertUtil::mapTraining).collect(Collectors.toList()));
        result.setEducations(profile.getEducation().stream().map(ModelConvertUtil::mapEducation).collect(Collectors.toList()));
        result.setSectors(profile.getSectors().stream().map(ModelConvertUtil::mapSector).collect(Collectors.toList()));
        result.setCareers(profile.getCareerEntries().stream().map(ModelConvertUtil::mapCareer).collect(Collectors.toList()));
        result.setKeySkills(profile.getSpecialFieldEntries().stream().map(ModelConvertUtil::mapKeySkill).collect(Collectors.toList()));
        // Skills under the names of the skill tree, also in the projects (#208)
        SkillTreeLookup lookup = new SkillTreeLookup(skillServiceClient);
        result.setProjects(mapProjects(profile.getProjects(), lookup));

        result.setProjectRoles(collectProjectRoles(profile.getProjects()));


        result.setDisplayCategories(createDisplayCategories(profile.getSkills(), lookup));
        result.setLocalization(localization == null || localization.isBlank() ? null : localization.trim());
        viewProfileLocalizationService.localize(result);
        applyInitialSorting(result);
        result = viewProfileRepository.save(result);
        return result;
    }

    private void applyInitialSorting(ViewProfile viewProfile) {
        viewProfileSortService.sortEntryByName(viewProfile, NameComparableEntryType.SECTOR, true);
        viewProfileSortService.sortEntryByName(viewProfile, NameComparableEntryType.KEY_SKILL, true);
        viewProfileSortService.sortEntryByName(viewProfile, NameComparableEntryType.LANGUAGE, true);
        viewProfileSortService.sortEntryByName(viewProfile, NameComparableEntryType.QUALIFICATION, true);
        viewProfileSortService.sortEntryByName(viewProfile, NameComparableEntryType.TRAINING, true);
        viewProfileSortService.sortEntryByName(viewProfile, NameComparableEntryType.PROJECT_ROLE, true);
        viewProfileSortService.sortEntryByName(viewProfile, NameComparableEntryType.DISPLAY_CATEGORY, true);

        viewProfileSortService.sortEntryByStartDate(viewProfile, StartEndDateComparableEntryType.CAREER, true);
        viewProfileSortService.sortEntryByStartDate(viewProfile, StartEndDateComparableEntryType.EDUCATION, true);
        viewProfileSortService.sortEntryByEndDate(viewProfile, StartEndDateComparableEntryType.PROJECT, false);

        for (int projIndex = 0; projIndex < viewProfile.getProjects().size(); projIndex++) {
            viewProfileSortService.sortSkillsInProjectByName(viewProfile, projIndex, true);
        }
        for (int displayIndex = 0; displayIndex < viewProfile.getDisplayCategories().size(); displayIndex++) {
            viewProfileSortService.sortSkillsInDisplayByName(viewProfile, displayIndex, true);
        }
    }

    private List<ProjectRole> collectProjectRoles(Collection<ProfileProject> projects) {
        return projects.stream()
                .map(ProfileProject::getProjectRoles)
                // This has the effect of flat mapping every project role into a new stream
                // as a result, a long stream with all project roles is created
                .flatMap(nameEntities -> nameEntities.stream().map(ModelConvertUtil::mapProjectRole))
                .distinct()
                .collect(Collectors.toList());
    }

    private Project mapProject(ProfileProject profileProject, SkillTreeLookup lookup) {
        Project result = new Project();
        result.setId(profileProject.getId());
        result.setEndDate(profileProject.getEndDate());
        result.setStartDate(profileProject.getStartDate());
        result.setName(profileProject.getName());
        String broker = profileProject.getBroker() == null ? null : profileProject.getBroker().getName();
        String client = profileProject.getClient() == null ? null : profileProject.getClient().getName();
        result.setBroker(broker);
        result.setClient(client);
        result.setDescription(profileProject.getDescription());
        result.setEnabled(true);
        result.setProjectRoles(mapProjectRole(profileProject.getProjectRoles()));
        result.setSkills(mapProjectSkills(profileProject.getSkills(), lookup));
        return result;
    }

    private List<ProjectRole> mapProjectRole(Collection<NameEntity> projectRoles) {
        return projectRoles.stream().map(ModelConvertUtil::mapProjectRole).collect(Collectors.toList());
    }

    /**
     * Under the names of the skill tree (#208); an alias and the name of the same skill become one, with the higher
     * rating
     */
    private List<Skill> mapProjectSkills(Collection<ProfileSkill> skills, SkillTreeLookup lookup) {
        Map<String, Skill> byName = new LinkedHashMap<>();
        skills.forEach(profileSkill -> {
            Skill skill = ModelConvertUtil.mapFlatSkill(profileSkill);
            skill.setName(lookup.treeName(profileSkill.getName()));
            byName.merge(skill.getName(), skill, (one, other) -> rating(other) > rating(one) ? other : one);
        });
        return new ArrayList<>(byName.values());
    }

    private static int rating(Skill skill) {
        return skill.getRating() == null ? 0 : skill.getRating();
    }

    private List<Project> mapProjects(Collection<ProfileProject> projects, SkillTreeLookup lookup) {
        return projects.stream().map(project -> mapProject(project, lookup)).collect(Collectors.toList());
    }

    private ViewProfileInfo createInfo(String initials, String name, String viewDescription) {
        ViewProfileInfo viewProfileInfo = new ViewProfileInfo();
        viewProfileInfo.setCreationDate(LocalDate.now());
        viewProfileInfo.setOwnerInitials(initials);
        viewProfileInfo.setViewDescription(viewDescription);
        viewProfileInfo.setName(name);
        setConsultantData(viewProfileInfo, initials);
        return viewProfileInfo;
    }

    private void setConsultantData(ViewProfileInfo viewProfileInfo, String initials) {
        ResponseEntity<ConsultantInfo> response = profileServiceClient.findByInitials(initials);
        if (response != null && response.getBody() != null) {
            ConsultantInfo consultantInfo = response.getBody();
            viewProfileInfo.setConsultantBirthDate(consultantInfo.getBirthDate());
            String fullName = consultantInfo.getFirstName() + " " + consultantInfo.getLastName();
            if (consultantInfo.getTitle() != null && !consultantInfo.getTitle().isEmpty()) {
                fullName = consultantInfo.getTitle() + " " + fullName;
            }
            viewProfileInfo.setConsultantName(fullName);
        } else {
            LOG.error("Could not resolve consultant info for " + initials);
            viewProfileInfo.setConsultantBirthDate(LocalDate.now());
            viewProfileInfo.setConsultantName("ERROR COULD NOT RESOLVE NAME");
        }
    }

    /**
     * Display categories as specific as possible (#169), but only categories the skill tree marks as display category
     * (#197): each skill starts at the lowest of them on its way up the tree, its own category if that is marked. A
     * category with fewer than {@link #minSkillsPerCategory} skills of the profile passes them on to the next display
     * category above, from the bottom up, so that skills brought together count there. A skill without any display
     * category above it stays at its own category.
     */
    private List<Category> createDisplayCategories(Collection<ProfileSkill> profileSkills, SkillTreeLookup lookup) {
        // An alias and the name of the same skill become one skill (#208)
        Map<String, Placement> byName = new LinkedHashMap<>();
        profileSkills.forEach(profileSkill -> {
            Placement placement = toPlacement(profileSkill, lookup);
            byName.merge(placement.skill.getName(), placement, ViewProfileCreatorService::mergePlacements);
        });
        List<Placement> placements = new ArrayList<>(byName.values());
        moveUpSmallCategories(placements);
        return toDisplayCategories(placements);
    }

    /**
     * A skill on its way up: the display categories from its own upwards (#197), or just its own if there are none
     */
    private static final class Placement {
        private final Skill skill;
        private final List<SkillServiceCategory> steps;
        private int step = 0;

        private Placement(Skill skill, List<SkillServiceCategory> steps) {
            this.skill = skill;
            this.steps = steps;
        }

        private SkillServiceCategory category() {
            return steps.get(step);
        }

        private boolean canMoveUp() {
            return step + 1 < steps.size();
        }

        private void moveUp() {
            step++;
        }
    }

    /**
     * The higher rating and the versions of both
     */
    private static Placement mergePlacements(Placement one, Placement other) {
        if (rating(other.skill) > rating(one.skill)) {
            one.skill.setRating(other.skill.getRating());
        }
        List<String> versions = Stream.of(one.skill, other.skill)
                .filter(skill -> skill.getVersions() != null)
                .flatMap(skill -> skill.getVersions().stream())
                .map(SkillVersion::getName)
                .distinct()
                .collect(Collectors.toList());
        one.skill.setVersions(versions);
        return one;
    }

    private Placement toPlacement(ProfileSkill profileSkill, SkillTreeLookup lookup) {
        SkillServiceSkill serviceSkill = lookup.skill(profileSkill.getName())
                .orElseGet(() -> skillServiceClient.getDefaultSkillByName(profileSkill.getName()));
        Skill skill = new Skill(
                serviceSkill.getId() != null ? serviceSkill.getId().longValue() : -1,
                serviceSkill.getQualifier(),
                profileSkill.getRating(),
                true,
                null
        );
        skill.setVersions(profileSkill.getVersions());

        SkillServiceCategory own = serviceSkill.getCategory() != null ? serviceSkill.getCategory() : other();
        List<SkillServiceCategory> steps = new ArrayList<>();
        for (SkillServiceCategory category = own; category != null; category = category.getCategory()) {
            if (Boolean.TRUE.equals(category.getDisplay())) {
                steps.add(category);
            }
        }
        if (steps.isEmpty()) {
            steps.add(own);
        }
        return new Placement(skill, steps);
    }

    /**
     * Deepest categories first: what moves up counts in the category above, which comes later
     */
    private void moveUpSmallCategories(List<Placement> placements) {
        Set<String> done = new HashSet<>();
        while (true) {
            Map<String, List<Placement>> byCategory = placements.stream()
                    .collect(Collectors.groupingBy(placement -> key(placement.category()), LinkedHashMap::new, Collectors.toList()));
            Optional<Map.Entry<String, List<Placement>>> deepest = byCategory.entrySet().stream()
                    .filter(entry -> !done.contains(entry.getKey()))
                    .max(Comparator.comparingInt(entry -> depth(entry.getValue().get(0).category())));
            if (!deepest.isPresent()) {
                return;
            }
            done.add(deepest.get().getKey());
            List<Placement> group = deepest.get().getValue();
            if (group.size() < minSkillsPerCategory) {
                group.stream().filter(Placement::canMoveUp).forEach(Placement::moveUp);
            }
        }
    }

    private List<Category> toDisplayCategories(List<Placement> placements) {
        Map<String, Category> categories = new LinkedHashMap<>();
        placements.forEach(placement -> {
            Category category = categories.computeIfAbsent(key(placement.category()), key -> {
                Category displayCategory = mapCategory(placement.category());
                displayCategory.setIsDisplay(true);
                displayCategory.setEnabled(true);
                return displayCategory;
            });
            placement.skill.setDisplayCategory(category);
        });
        return new ArrayList<>(categories.values());
    }

    /** Categories of different skills are different objects; the same category has the same id (or name) */
    private static String key(SkillServiceCategory category) {
        return category.getId() != null ? "id:" + category.getId() : "name:" + category.getQualifier();
    }

    private static int depth(SkillServiceCategory category) {
        int depth = 0;
        for (SkillServiceCategory above = category.getCategory(); above != null; above = above.getCategory()) {
            depth++;
        }
        return depth;
    }

    private Category mapCategory(SkillServiceCategory category) {
        Category newCategory = new Category();
        newCategory.setId(category.getId() != null ? category.getId().longValue() : -1);
        newCategory.setName(category.getQualifier());
        newCategory.setIsDisplay(true);

        return newCategory;
    }
}
