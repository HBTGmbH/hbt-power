package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.client.profile.model.*;
import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.SkillServiceFallback;
import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.*;
import de.hbt.pwr.view.model.entries.Project;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Services that allows importing of profiles from the pwr-profile-service and conversion into
 * a {@link ViewProfile}.
 * <p>
 *    To accomplish this, the service needs to use the {@link ProfileServiceClient} to retrieve the base data and the
 *     {@link SkillServiceClient} to look up every skill and create the partial skill tree accordingly
 * </p>
 * <p>
 *     Contains several conversion methods to convert the profile model into the view profile model.
 * </p>
 */
@Service
public class ViewProfileImportService {

    private final ProfileServiceClient profileServiceClient;

    private final SkillServiceClient skillServiceClient;

    private final SkillServiceFallback skillServiceFallback;

    private final ViewProfileRepository viewProfileRepository;

    public ViewProfileImportService(ProfileServiceClient profileServiceClient, SkillServiceClient skillServiceClient, SkillServiceFallback skillServiceFallback, ViewProfileRepository viewProfileRepository) {
        this.profileServiceClient = profileServiceClient;
        this.skillServiceClient = skillServiceClient;
        this.skillServiceFallback = skillServiceFallback;
        this.viewProfileRepository = viewProfileRepository;
    }

    private static Career toCareer(StepEntry stepEntry) {
        return new Career(stepEntry.getNameEntity().getName(), stepEntry.getStartDate(), stepEntry.getEndDate(), true);
    }

    private static Education toEducation(EducationEntry educationEntry) {
        return new Education(educationEntry.getNameEntity().getName(), educationEntry.getStartDate(),
                educationEntry.getEndDate(), educationEntry.getDegree(), true);
    }

    private static KeySkill toKeySkill(ProfileEntry profileEntry) {
        return new KeySkill(profileEntry.getNameEntity().getName(), true);
    }

    private static Qualification toQualification(QualificationEntry qualificationEntry) {
        return new Qualification(qualificationEntry.getNameEntity().getName(), qualificationEntry.getDate(), true);
    }

    private static Training toTraining(StepEntry stepEntry) {
        return new Training(stepEntry.getNameEntity().getName(), stepEntry.getStartDate(), stepEntry.getEndDate(), true);
    }

    private static Sector toSector(ProfileEntry profileEntry) {
        return new Sector(profileEntry.getNameEntity().getName(), true);
    }

    private static boolean contains(List<Category> categories, SkillServiceCategory skillServiceCategory) {
        return categories.stream().anyMatch(category -> category.getName().equals(skillServiceCategory.getQualifier()));
    }

    private static Category toNewCategory(SkillServiceCategory skillServiceCategory) {
        Category category = new Category();
        category.setName(skillServiceCategory.getQualifier());
        category.setIsDisplay(false);
        if(skillServiceCategory.getCategory() != null) {
            category.setParent(toNewCategory(skillServiceCategory.getCategory()));
        }
        return category;
    }

    private Skill toSkill(SkillServiceSkill skillServiceSkill) {
        Skill skill = new Skill();
        skill.setEnabled(true);
        skill.setName(skillServiceSkill.getQualifier());
        if(skillServiceSkill.getCategory() != null) {
            Category category = toNewCategory(skillServiceSkill.getCategory());
            skill.setCategory(category);
        }
        return skill;
    }

    private static ProjectRole toProjectRole(NameEntity nameEntity) {
        return new ProjectRole(nameEntity.getName(), true);
    }

    private static Project toProject(ProfileProject project,
                                     Map<String, Skill> skillsByName,
                                     Map<String, ProjectRole> projectRolesByName) {
        String clientName = project.getClient() == null ? null : project.getClient().getName();
        String brokerName = project.getBroker() == null ? null : project.getBroker().getName();
        List<ProjectRole> projectRoles = new ArrayList<>();
        for (NameEntity nameEntity : project.getProjectRoles()) {
            ProjectRole role = projectRolesByName.get(nameEntity.getName());
            if(role == null) {
                role = toProjectRole(nameEntity);
                projectRolesByName.put(role.getName(), role);
            }
            projectRoles.add(role);
        }

        List<Skill> skills = new ArrayList<>();
        for (ProfileSkill profileSkill : project.getSkills()) {
            skills.add(skillsByName.get(profileSkill.getName()));
        }

        return new Project(project.getName(), project.getDescription(), clientName, brokerName,
                project.getStartDate(), project.getEndDate(), projectRoles, skills, true);
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
                // This ONLY works because it is assumed that toMerge is a strict, linear hierachy, where
                // each category only ever has one child!
                if(toMerge.getChildren().size() != 1) {
                    throw new RuntimeException("toMerge must only ever have one child");
                }
                Category mergeChild = toMerge.getChildren().get(0);
                merge(root.getChildren().get(index), mergeChild);
            } else if(toMerge.getChildren().size() <= 0) {
                // when the category to merge has no more children, the end of the recursion is reached
                // without any insertion happening. This means that the whole, initial branch hierachy
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
     * @param root
     * @param toAdd
     */
    private Skill mergeIntoTree(Category root, ProfileSkill toAdd) {
        SkillServiceSkill skillServiceSkill = skillServiceClient.getSkillByName(toAdd.getName());
        if(skillServiceSkill == null) {
            skillServiceSkill = skillServiceFallback.getSkillByName(toAdd.getName());
        }
        Skill skill = toSkill(skillServiceSkill);
        Category highestParent = skill.getCategory();
        while(highestParent.getParent() != null) {
            highestParent = highestParent.getParent();
        }
        merge(root, highestParent);
        return skill;
    }

    private List<Project> importProjects(Set<ProfileProject> projects,
                                         Map<String, Skill> skillsByName,
                                         Map<String, ProjectRole> projectRolesByName) {
        return projects.stream().map(profileProject -> toProject(profileProject, skillsByName, projectRolesByName)).collect(Collectors.toList());
    }

    public ViewProfile createViewProfile(String initials, String name, Locale locale) {
        Profile profile = profileServiceClient.getSingleProfile(initials);
        ViewProfile viewProfile = new ViewProfile();

        // Meta data
        viewProfile.setName(name);
        viewProfile.setLocale(locale);
        viewProfile.setCreationDate(LocalDate.now());
        viewProfile.setOwnerInitials(initials);

        // Actual model conversion from profile
        viewProfile.setDescription(profile.getDescription());
        viewProfile.setCareers(profile.getCareerEntries().stream().map(ViewProfileImportService::toCareer).collect(Collectors.toList()));
        viewProfile.setEducations(profile.getEducation().stream().map(ViewProfileImportService::toEducation).collect(Collectors.toList()));
        viewProfile.setKeySkills(profile.getKeySkillEntries().stream().map(ViewProfileImportService::toKeySkill).collect(Collectors.toList()));
        viewProfile.setQualifications(profile.getQualification().stream().map(ViewProfileImportService::toQualification).collect(Collectors.toList()));
        viewProfile.setTrainings(profile.getTrainingEntries().stream().map(ViewProfileImportService::toTraining).collect(Collectors.toList()));
        viewProfile.setSectors(profile.getSectors().stream().map(ViewProfileImportService::toSector).collect(Collectors.toList()));

        // Skill conversion is more complicated.
        // USe of two data models is necessary here (skill and profile service model).
        // The view profile builds a partial skill tree with every skill from the profile present in it
        // This partial skill tree is not available in the profile services' model. Therefor, the
        // skill service needs to be queried every time
        Category root = new Category();
        root.setIsDisplay(false);
        root.setName("__ROOT__");

        Map<String, Skill> skillsByName = profile.getSkills()
                .stream()
                .map(profileSkill -> mergeIntoTree(root, profileSkill))
                .collect(Collectors.toMap(Skill::getName, skill -> skill));
        Map<String, ProjectRole> projectRolesByName = new HashMap<>();

        viewProfile.setProjects(importProjects(profile.getProjects(), skillsByName, projectRolesByName));
        viewProfile.setProjectRoles(new ArrayList<>(projectRolesByName.values()));
        viewProfile.setRootCategory(root);
        viewProfile.setSkills(new ArrayList<>(skillsByName.values()));
        return viewProfileRepository.save(viewProfile);
    }
}
