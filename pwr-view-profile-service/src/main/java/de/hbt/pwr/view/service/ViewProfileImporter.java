package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.client.profile.model.*;
import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.SkillServiceFallback;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.exception.NoProfileAvailableException;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.*;
import de.hbt.pwr.view.model.entries.sort.NameComparableEntryType;
import de.hbt.pwr.view.model.entries.sort.StartEndDateComparableEntryType;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import de.hbt.pwr.view.util.ModelConvertUtil;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ViewProfileImporter {

    public static final String PWR_ROOT_NAME = "root";

    private final ProfileServiceClient profileServiceClient;

    private final SkillServiceClient skillServiceClient;

    private final SkillServiceFallback skillServiceFallback;

    private final ViewProfileRepository viewProfileRepository;

    private final ViewProfileSortService viewProfileSortService;

    private static final Logger LOG = Logger.getLogger(ViewProfileImporter.class);


    @Autowired
    public ViewProfileImporter(ProfileServiceClient profileServiceClient, SkillServiceClient skillServiceClient, SkillServiceFallback skillServiceFallback, ViewProfileRepository viewProfileRepository, ViewProfileSortService viewProfileSortService) {
        this.profileServiceClient = profileServiceClient;
        this.skillServiceClient = skillServiceClient;
        this.skillServiceFallback = skillServiceFallback;
        this.viewProfileRepository = viewProfileRepository;
        this.viewProfileSortService = viewProfileSortService;
    }

    private List<Language> mapLanguages(Collection<LanguageSkill> profileLanguages) {
        return profileLanguages.stream().map(ModelConvertUtil::mapLanguage).collect(Collectors.toList());
    }

    private List<Qualification> mapQualifications(Collection<QualificationEntry> qualificationEntries) {
        return qualificationEntries.stream().map(ModelConvertUtil::mapQualification).collect(Collectors.toList());
    }

    private List<Training> mapTrainings(Collection<StepEntry> trainingEntries) {
        return trainingEntries.stream().map(ModelConvertUtil::mapTraining).collect(Collectors.toList());
    }

    private List<Education> mapEducations(Collection<EducationEntry> educationEntries) {
        return educationEntries.stream().map(ModelConvertUtil::mapEducation).collect(Collectors.toList());
    }

    private List<Sector> mapSectors(Collection<ProfileEntry> sectorEntries) {
        return sectorEntries.stream().map(ModelConvertUtil::mapSector).collect(Collectors.toList());
    }

    private List<Career> mapCareers(Collection<StepEntry> careerEntries) {
        return careerEntries.stream().map(ModelConvertUtil::mapCareer).collect(Collectors.toList());
    }

    private List<KeySkill> mapKeySkills(Collection<ProfileEntry> keySkillEntries) {
        return keySkillEntries.stream().map(ModelConvertUtil::mapKeySkill).collect(Collectors.toList());
    }

    private List<ProjectRole> mapProjectRole(Collection<NameEntity> projectRoles) {
        return projectRoles.stream().map(ModelConvertUtil::mapProjectRole).collect(Collectors.toList());
    }

    private List<Skill> mapFlatSkills(Collection<ProfileSkill> skills) {
        return skills.stream().map(ModelConvertUtil::mapFlatSkill).collect(Collectors.toList());
    }

    private Project mapProject(ProfileProject profileProject) {
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
        result.setSkills(mapFlatSkills(profileProject.getSkills()));
        return result;
    }

    private List<Project> mapProjects(Collection<ProfileProject> projects) {
        return projects.stream().map(this::mapProject).collect(Collectors.toList());
    }

    private List<ProjectRole> collectProjectRoles(Collection<ProfileProject> projects) {
        Set<ProjectRole> res = projects.stream()
                .map(ProfileProject::getProjectRoles)
                // This has the effect of flat mapping every project role into a new stream
                // as a result, a long stream with all project roles is created
                .flatMap(nameEntities -> nameEntities.stream().map(ModelConvertUtil::mapProjectRole))
                .collect(Collectors.toSet());
        return new ArrayList<>(res);
    }

    private void merge(Category root, Category toMerge) {
        if(toMerge != null) {
            int index = root.getChildren().indexOf(toMerge);
            if(index == -1) {
                // Found a part of the tree where the category to merge can be merged into
                toMerge.setParent(root);
            } else if(!toMerge.getChildren().isEmpty()) {
                // Means that the current 'root' had the category to merge as a child
                // As a result, the recursion is increased in order to find a category
                // into which the candidate fits.
                // The increasing of the recursion moves the validation to the next deeper layer
                // This ONLY works because it is assumed that toMerge is a strict, linear hierarchy, where
                // each category only ever has one child!
                if(toMerge.getChildren().size() != 1) {
                    throw new RuntimeException("toMerge must only ever have one child");
                }
                Category mergeChild = toMerge.getChildren().get(0);
                merge(root.getChildren().get(index), mergeChild);
            } else if(toMerge.getChildren().isEmpty()) {
                // when the category to merge has no more children, the end of the recursion is reached
                // without any insertion happening. This means that the whole, initial branch hierarchy
                // was already COMPLETELY included in the tree. As a result, only the skill needs to
                // be included.
                // As another constraint, the category MUST ONLY have a single skill
                if(toMerge.getSkills().size() != 1) {
                    throw new RuntimeException("toMerge must only ever have a single skill");
                }
                Skill skill = toMerge.getSkills().get(0);
                skill.setCategory(root.getChildren().get(index));
            }
        }
    }

    /**
     * Merges a given profile skill into the skill tree that is used for display.
     * <p>
     *     This invokes resolving of the skill against the skill service.
     * </p>
     * @param root category
     * @param toAdd to add
     */
    private Skill mergeIntoTree(Category root, ProfileSkill toAdd) {
        SkillServiceSkill skillServiceSkill = skillServiceClient.getSkillByName(toAdd.getName());
        // Because the design of the skill service has a flaw here, the fallback won't trigger
        // because when a skill does not exist, null is returned instead of a 404.
        // use the fallback manually...
        if(skillServiceSkill == null) {
            skillServiceSkill = skillServiceFallback.getSkillByName(toAdd.getName());
        }
        Skill skill = ModelConvertUtil.mapSkill(skillServiceSkill, toAdd);
        Category highestParent = skill.getCategory();
        while(highestParent.getParent() != null) {
            highestParent = highestParent.getParent();
        }
        merge(root, highestParent);
        return skill;
    }


    /**
     * Builds the skill tree and returns the root category
     * @param skills to be mapped into the tree
     * @return root category
     */
    private Category buildSkillTree(Collection<ProfileSkill> skills) {
        Category root = new Category(PWR_ROOT_NAME);
        skills.forEach(skill -> mergeIntoTree(root, skill));
        // The map is there to collect all display categories for the list of display categories.
        return root;
    }


    /**
     * Sets the display categories for all {@link Skill} that are either direct or indirect children to thie provided
     * category.
     * @param category that is the root of the current, partial tree
     * @param displayCategoriesByName serves a collector for all display categories
     */
    private void setDisplayCategoriesForAllSkills(Category category,  Map<String, Category> displayCategoriesByName) {
        category.getSkills().forEach(skill -> {
            // Because null categories might cause serious problems in the next call, check that
            // this does not happen. In terms of business logic, skills without categories >must< not exist anyway
            if(skill.getCategory() == null) {
                throw new RuntimeException("Constraint violation! Skill hat null category: " + skill.toString());
            }
            ModelConvertUtil.setDisplayCategory(skill, displayCategoriesByName);
        });
        category.getChildren().forEach(child -> setDisplayCategoriesForAllSkills(child, displayCategoriesByName));
    }

    /**
     * Uses the skill tree to infer all display categories and returns them as list.
     * @param root of the skill tree
     * @return all inferred display categories.
     */
    private List<Category> mapDisplayCategories(Category root) {
        // The map is there to collect all display categories for the list of display categories.
        // Map to avoid duplicates. Set won't do it.
        Map<String, Category> displayCategoriesByName = new HashMap<>();
        setDisplayCategoriesForAllSkills(root, displayCategoriesByName);
        return new ArrayList<>(displayCategoriesByName.values());
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

        for(int projIndex = 0; projIndex < viewProfile.getProjects().size(); projIndex++) {
            viewProfileSortService.sortSkillsInProjectByName(viewProfile, projIndex, true);
        }
        for(int displayIndex = 0; displayIndex < viewProfile.getDisplayCategories().size(); displayIndex++) {
            viewProfileSortService.sortSkillsInDisplayByName(viewProfile, displayIndex, true);
        }
    }

    private void setConsultantData(ViewProfile viewProfile, String initials) {
        ResponseEntity<ConsultantInfo> response = profileServiceClient.findByInitials(initials);
        if(response != null) {
            ConsultantInfo consultantInfo = response.getBody();
            viewProfile.setConsultantBirthDate(consultantInfo.getBirthDate());
            String fullName = consultantInfo.getFirstName() + " " + consultantInfo.getLastName();
            if(consultantInfo.getTitle() != null && !consultantInfo.getTitle().isEmpty()) {
                fullName = consultantInfo.getTitle() + " " + fullName;
            }
            viewProfile.setConsultantName(fullName);
        } else {
            LOG.error("Could not resolve consultant info for " + initials);
            viewProfile.setConsultantBirthDate(LocalDate.now());
            viewProfile.setConsultantName("ERROR COULD NOT RESOLVE NAME");
        }

    }

    /**
     * Imports a {@link Profile} and creates a {@link ViewProfile} for the consultant represented by <code>initials</code>.
     * The imported {@link Profile} is always the most current profile available, either
     * @param initials of the consultant whose profile is used.
     * @return the newly persisted {@link ViewProfile}
     */
    public ViewProfile importViewProfile(String initials, String name, String viewDescription) {
        ViewProfile result = new ViewProfile();
        Profile profile;
        try {
            profile = profileServiceClient.getSingleProfile(initials);
        } catch (RuntimeException e) {
            LOG.error("Could not get profile from client for " + initials, e);
            // Usually, this will be a HystrixRuntimeException, but docs are missing a bit of information,
            // so we'll catch a general exception
            throw new NoProfileAvailableException(initials);
        }

        setConsultantData(result, initials);

        result.setCreationDate(LocalDate.now());
        result.setDescription(profile.getDescription());
        result.setOwnerInitials(initials);
        result.setViewDescription(viewDescription);
        result.setName(name);

        result.setLanguages(mapLanguages(profile.getLanguages()));
        result.setQualifications(mapQualifications(profile.getQualification()));
        result.setTrainings(mapTrainings(profile.getTrainingEntries()));
        result.setEducations(mapEducations(profile.getEducation()));
        result.setSectors(mapSectors(profile.getSectors()));
        result.setCareers(mapCareers(profile.getCareerEntries()));
        result.setKeySkills(mapKeySkills(profile.getKeySkillEntries()));
        result.setProjects(mapProjects(profile.getProjects()));

        result.setProjectRoles(collectProjectRoles(profile.getProjects()));

        Category root = buildSkillTree(profile.getSkills());
        result.setRootCategory(root);
        // Must be called after the skill tree has been built
        result.setDisplayCategories(mapDisplayCategories(root));

        viewProfileRepository.save(result);
        applyInitialSorting(result);
        return result;
    }

    /**
     * Imports a {@link Profile} and creates a {@link ViewProfile} for the consultant represented by <code>initials</code>.
     * The imported {@link Profile} is always the most current profile available, either
     * @param initials of the consultant whose profile is used.
     * @return the newly persisted {@link ViewProfile}
     */
    public ViewProfile importViewProfile(String initials) {
       return importViewProfile(initials,"View Profile of " + initials, "");
    }
}
