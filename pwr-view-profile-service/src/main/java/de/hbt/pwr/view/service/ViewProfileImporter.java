package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.client.profile.model.Profile;
import de.hbt.pwr.view.client.profile.model.ProfileProject;
import de.hbt.pwr.view.client.profile.model.ProfileSkill;
import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.SkillServiceFallback;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.*;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import de.hbt.pwr.view.util.ModelConvertUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ViewProfileImporter {

    public static final String PWR_ROOT_NAME = "root";

    private final ProfileServiceClient profileServiceClient;

    private final SkillServiceClient skillServiceClient;

    private final SkillServiceFallback skillServiceFallback;

    private final ViewProfileRepository viewProfileRepository;

    @Autowired
    public ViewProfileImporter(ProfileServiceClient profileServiceClient, SkillServiceClient skillServiceClient, SkillServiceFallback skillServiceFallback, ViewProfileRepository viewProfileRepository) {
        this.profileServiceClient = profileServiceClient;
        this.skillServiceClient = skillServiceClient;
        this.skillServiceFallback = skillServiceFallback;
        this.viewProfileRepository = viewProfileRepository;
    }




    private void addLanguages(ViewProfile viewProfile, Profile profile) {
        List<Language> languages = profile.getLanguages().stream().map(ModelConvertUtil::mapLanguage).collect(Collectors.toList());
        viewProfile.setLanguages(languages);
    }

    private void addQualifications(ViewProfile viewProfile, Profile profile) {
        List<Qualification> qualifications = profile.getQualification().stream().map(ModelConvertUtil::mapQualification).collect(Collectors.toList());
        viewProfile.setQualifications(qualifications);
    }

    private void addTrainings(ViewProfile viewProfile, Profile profile) {
        List<Training> trainings = profile.getTrainingEntries().stream().map(ModelConvertUtil::mapTraining).collect(Collectors.toList());
        viewProfile.setTrainings(trainings);
    }

    private void addEducations(ViewProfile viewProfile, Profile profile) {
        List<Education> educations = profile.getEducation().stream().map(ModelConvertUtil::mapEducation).collect(Collectors.toList());
        viewProfile.setEducations(educations);
    }

    private void addSectors(ViewProfile viewProfile, Profile profile) {
        List<Sector> sectors = profile.getSectors().stream().map(ModelConvertUtil::mapSector).collect(Collectors.toList());
        viewProfile.setSectors(sectors);
    }

    private void addCareers(ViewProfile viewProfile, Profile profile) {
        List<Career> careers = profile.getCareerEntries().stream().map(ModelConvertUtil::mapCareer).collect(Collectors.toList());
        viewProfile.setCareers(careers);
    }

    private void addKeySkills(ViewProfile viewProfile, Profile profile) {
        List<KeySkill> keySkills = profile.getKeySkillEntries().stream().map(ModelConvertUtil::mapKeySkill).collect(Collectors.toList());
        viewProfile.setKeySkills(keySkills);
    }

    private Skill importSkillFlat(ProfileSkill skill) {
        return Skill.builder().name(skill.getName()).rating(skill.getRating()).enabled(true).build();
    }

    private Project importProject(ProfileProject profileProject) {
        Project result = new Project();
        result.setEndDate(profileProject.getEndDate());
        result.setStartDate(profileProject.getStartDate());
        result.setName(profileProject.getName());
        String broker = profileProject.getBroker() == null ? null : profileProject.getBroker().getName();
        String client = profileProject.getClient() == null ? null : profileProject.getClient().getName();
        result.setBroker(broker);
        result.setClient(client);
        result.setDescription(profileProject.getDescription());
        result.setEnabled(true);
        result.setProjectRoles(profileProject.getProjectRoles().stream().map(ModelConvertUtil::mapProjectRole).collect(Collectors.toList()));
        result.setSkills(profileProject.getSkills().stream().map(this::importSkillFlat).collect(Collectors.toList()));
        return result;
    }

    private void addProjects(ViewProfile viewProfile, Profile profile) {
        List<Project> projects = profile.getProjects().stream().map(this::importProject).collect(Collectors.toList());
        viewProfile.setProjects(projects);
    }

    private void addProjectRoles(ViewProfile viewProfile, Profile profile) {
        Set<ProjectRole> projectRoles = new HashSet<>();
        profile.getProjects().forEach(profileProject -> {
            profileProject.getProjectRoles().forEach(nameEntity -> {
                projectRoles.add(ModelConvertUtil.mapProjectRole(nameEntity));
            });
        });
        viewProfile.setProjectRoles(new ArrayList<>(projectRoles));
    }

    private void merge(Category root, Category toMerge) {
        if(toMerge != null) {
            int index = root.getChildren().indexOf(toMerge);
            if(index == -1) {
                // Found a part of the tree where the category to merge can be merged into
                toMerge.setParent(root);
            } else if(toMerge.getChildren().size() > 0) {
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
            } else if(toMerge.getChildren().size() <= 0) {
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
     * @param root todo
     * @param toAdd todo
     */
    private Skill mergeIntoTree(Category root, ProfileSkill toAdd) {
        SkillServiceSkill skillServiceSkill = skillServiceClient.getSkillByName(toAdd.getName());
        if(skillServiceSkill == null) {
            skillServiceSkill = skillServiceFallback.getSkillByName(toAdd.getName());
        }
        Skill skill = ModelConvertUtil.mapSkill(skillServiceSkill);
        Category highestParent = skill.getCategory();
        while(highestParent.getParent() != null) {
            highestParent = highestParent.getParent();
        }
        merge(root, highestParent);
        return skill;
    }


    private void addSkills(ViewProfile viewProfile, Profile profile) {
        Category root = new Category(PWR_ROOT_NAME);
        Map<String, Skill> skillsByName = profile.getSkills()
                .stream()
                .map(profileSkill -> mergeIntoTree(root, profileSkill))
                .collect(Collectors.toMap(Skill::getName, skill -> skill));
        viewProfile.setRootCategory(root);
    }




    private void setDisplayCategoriesForAllSkills(Category category,  Map<String, Category> displayCategoriesByName) {
        category.getSkills().forEach(skill -> {
            // Because null categories might cause serious problems in the next call, check that
            // this does not happen. In terms of business logic, skills without categories >must< not exist anyway
            if(skill.getCategory() == null) {
                throw new RuntimeException("Constraint violation! Skill hat null category: " + skill.toString());
            }
            ModelConvertUtil.setDisplayCategory(skill);
        });
        category.getChildren().forEach(child -> setDisplayCategoriesForAllSkills(child, displayCategoriesByName));
    }

    private void setDisplayCategories(ViewProfile viewProfile) {
        // The map is there to collect all display categories for the list of display categories.
        Map<String, Category> displayCategoriesByName = new HashMap<>();
        setDisplayCategoriesForAllSkills(viewProfile.getRootCategory(), displayCategoriesByName);
        viewProfile.setDisplayCategories(new ArrayList<>(displayCategoriesByName.values()));
    }



    public ViewProfile importViewProfile(String initials) {
        ViewProfile result = new ViewProfile();
        Profile reference = profileServiceClient.getSingleProfile(initials);
        result.setDescription(reference.getDescription());
        result.setOwnerInitials(initials); // FIXME misses test

        addLanguages(result, reference);
        addQualifications(result, reference);
        addTrainings(result, reference);
        addEducations(result, reference);
        addSectors(result, reference);
        addCareers(result, reference);
        addKeySkills(result, reference);
        addProjects(result, reference);
        addProjectRoles(result, reference);
        addSkills(result, reference);
        // Must be called after the skill tree has been built
        setDisplayCategories(result);
        viewProfileRepository.save(result);
        return result;
    }
}
