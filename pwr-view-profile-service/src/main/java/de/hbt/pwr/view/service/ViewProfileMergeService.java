package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.exception.ViewProfileNotFoundException;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.Project;
import de.hbt.pwr.view.model.entries.ProjectRole;
import de.hbt.pwr.view.model.entries.ToggleableEntry;
import de.hbt.pwr.view.model.entries.sort.NameComparable;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

@Slf4j
@Service
public class ViewProfileMergeService {

    private final ViewProfileRepository viewProfileRepository;
    private final ViewProfileCreatorService viewProfileCreatorService;
    private final ViewProfileLocalizationService viewProfileLocalizationService;
    private final SkillServiceClient skillServiceClient;


    @Autowired
    public ViewProfileMergeService(ViewProfileRepository viewProfileRepository, ViewProfileCreatorService viewProfileCreatorService,
                                   ViewProfileLocalizationService viewProfileLocalizationService,
                                   SkillServiceClient skillServiceClient) {

        this.viewProfileRepository = viewProfileRepository;
        this.viewProfileCreatorService = viewProfileCreatorService;
        this.viewProfileLocalizationService = viewProfileLocalizationService;
        this.skillServiceClient = skillServiceClient;
    }

    public ViewProfile updateViewProfile(String oldId, String initials, ViewProfile.ViewProfileMergeOptions options) {
        //1. get old ViewProfile (VP)
        ViewProfile oldView = viewProfileRepository.findById(oldId).orElseThrow(() -> new ViewProfileNotFoundException(oldId));

        // 3. create new ViewProfile
        ViewProfile newView = viewProfileCreatorService.createViewProfile(initials, options.name, options.viewDescription, "",
                oldView.getLocalization());
        return mergeViewProfiles(oldView, newView, options);
    }

    ViewProfile mergeViewProfiles(ViewProfile oldView, ViewProfile newView, ViewProfile.ViewProfileMergeOptions options) {

        newView.getViewProfileInfo().setName(options.name);
        newView.getViewProfileInfo().setViewDescription(options.viewDescription);
        // Settings of the view profile (#151, #174)
        newView.setShowSkillVersions(oldView.getShowSkillVersions());
        newView.setLocalization(oldView.getLocalization());

        //2. merge old and new VP

        // ProfileEntries
        newView.setLanguages(mergeEntities(oldView.getLanguages(), newView.getLanguages()));
        newView.setQualifications(mergeEntities(oldView.getQualifications(), newView.getQualifications()));
        newView.setTrainings(mergeEntities(oldView.getTrainings(), newView.getTrainings()));
        newView.setEducations(mergeEntities(oldView.getEducations(), newView.getEducations()));
        newView.setSectors(mergeEntities(oldView.getSectors(), newView.getSectors()));
        newView.setCareers(mergeEntities(oldView.getCareers(), newView.getCareers()));
        newView.setKeySkills(mergeEntities(oldView.getKeySkills(), newView.getKeySkills()));

        // Projects
        newView.setProjects(mergeProjects(oldView.getProjects(), newView.getProjects(), new SkillTreeLookup(skillServiceClient)));
        // ProjectRoles
        newView.setProjectRoles(mergeEntities(oldView.getProjectRoles(), newView.getProjectRoles()));

        // Display Categories
        newView.setDisplayCategories(mergeDisplayCategories(oldView.getDisplayCategories(), newView.getDisplayCategories()));
        // The old display categories and projects stay; their names come from the current localizations (#174)
        viewProfileLocalizationService.localize(newView);

        if (!options.keepOld) {
            // delete the old one
            viewProfileRepository.delete(oldView);
        }
        newView = viewProfileRepository.save(newView);
        return newView;
    }

    private List<Project> mergeProjects(List<Project> oldList, List<Project> newList, SkillTreeLookup lookup) {
        return newList.stream()
                .map(newProject -> {
                    Optional<Project> maybeOldProject = oldList.stream()
                            .filter(oldProject -> Objects.equals(oldProject.getId(), newProject.getId()))
                            .findAny();
                    return maybeOldProject
                            .map(project -> mergeProject(newProject, project, lookup))
                            .orElse(newProject);
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(newProject -> findIndexIn(oldList, newProject)))
                .collect(Collectors.toList());
    }

    private Project mergeProject(Project newProject, Project oldProject, SkillTreeLookup lookup) {
        return newProject.toBuilder()
                .projectRoles(mergeProjectRoles(newProject.getProjectRoles(), oldProject.getProjectRoles()))
                .skills(mergeProjectSkills(newProject.getSkills(), oldProject.getSkills(), lookup))
                .enabled(oldProject.getEnabled())
                .build();
    }

    private List<ProjectRole> mergeProjectRoles(List<ProjectRole> newProjectRoles, List<ProjectRole> oldProjectRoles) {
        return newProjectRoles.stream()
                .map(newRole -> {
                    Boolean roleActive = oldProjectRoles.stream()
                            .filter(oldRole -> Objects.equals(oldRole.getName(), newRole.getName()))
                            .findAny()
                            .map(ProjectRole::getEnabled)
                            .orElse(true);
                    return newRole.toBuilder()
                            .enabled(roleActive)
                            .build();
                })
                .sorted(Comparator.comparing(newProject -> findIndexIn(oldProjectRoles, newProject)))
                .collect(Collectors.toList());
    }

    private List<Skill> mergeProjectSkills(List<Skill> newSkills, List<Skill> oldSkills, SkillTreeLookup lookup) {
        return newSkills.stream()
                .map(newSkill -> {
                    Boolean skillActive = oldSkills.stream()
                            .filter(oldSkill -> Objects.equals(oldSkill.getName(), newSkill.getName()))
                            .findAny()
                            .map(Skill::getEnabled)
                            .orElseGet(() -> enabledUnderTreeName(newSkill, oldSkills, lookup));
                    return newSkill.toBuilder()
                            .enabled(skillActive)
                            .build();
                })
                .sorted(Comparator.comparing(newProject -> findIndexIn(oldSkills, newProject)))
                .collect(Collectors.toList());
    }

    /**
     * Old view profiles kept the names of the profile in the projects, new ones take those of the skill tree (#208):
     * an old <code>.NET Core</code> is the new <code>.NET</code>. Shown if one of them was shown, or if none was there.
     */
    private static Boolean enabledUnderTreeName(Skill newSkill, List<Skill> oldSkills, SkillTreeLookup lookup) {
        List<Skill> renamed = oldSkills.stream()
                .filter(oldSkill -> oldSkill.getName() != null && newSkill.getName().equals(lookup.treeName(oldSkill.getName())))
                .collect(Collectors.toList());
        return renamed.isEmpty() || renamed.stream().anyMatch(oldSkill -> !Boolean.FALSE.equals(oldSkill.getEnabled()));
    }

    private Integer findIndexIn(List<Skill> oldList, Skill newSkill) {
        return IntStream
                .range(0, oldList.size())
                .filter(index -> Objects.equals(oldList.get(index).getId(), newSkill.getId()))
                .boxed()
                .findAny()
                .orElse(null);
    }

    private Integer findIndexIn(List<Project> oldList, Project newProject) {
        return IntStream
                .range(0, oldList.size())
                .filter(index -> Objects.equals(oldList.get(index).getId(), newProject.getId()))
                .boxed()
                .findAny()
                .orElse(null);
    }

    private Integer findIndexIn(List<ProjectRole> oldList, ProjectRole oldRole) {
        return IntStream
                .range(0, oldList.size())
                .filter(index -> Objects.equals(oldList.get(index).getName(), oldRole.getName()))
                .boxed()
                .findAny()
                .orElse(null);
    }

    private <T extends NameComparable & ToggleableEntry> List<T> mergeEntities(List<T> oldList, List<T> newList) {
        List<T> toReturn = new ArrayList<>();
        newList.forEach(newEntry -> {
            oldList.stream()
                    .filter(entry -> entry.getName().equals(newEntry.getName()))
                    .findFirst().ifPresent(entry -> newEntry.setEnabled(entry.getEnabled()));
            toReturn.add(newEntry);
        });
        return toReturn;
    }


    private List<Category> mergeDisplayCategories(List<Category> oldDisplays, List<Category> newDisplays) {
        List<Skill> oldSkills = oldDisplays.stream()
                .flatMap(cat -> cat != null && cat.getDisplaySkills() != null ? cat.getDisplaySkills().stream() : Stream.empty())
                .collect(Collectors.toList());
        List<Skill> newSkills = newDisplays.stream()
                .flatMap(cat -> cat != null && cat.getDisplaySkills() != null ? cat.getDisplaySkills().stream() : Stream.empty())
                .collect(Collectors.toList());


        // 1. delete all skills no more existing in the profile
        List<Skill> deletedSkills = oldSkills.stream()
                .filter(skill -> !newSkills.contains(skill))
                .collect(Collectors.toList());

        oldDisplays = oldDisplays.stream()
                .peek(category -> category.setDisplaySkills(
                        category.getDisplaySkills().stream()
                                .filter(skill -> !deletedSkills.contains(skill))
                                .collect(Collectors.toList())))
                .filter(category -> category.getDisplaySkills().size() > 0)
                .collect(Collectors.toList());

        List<Category> result = oldDisplays;
        List<Skill> skills = newSkills.stream()
                .filter(skill -> !oldSkills.contains(skill))
                .collect(Collectors.toList());
        skills.forEach(skill -> {
            if (result.stream().anyMatch(category -> category.getId().equals(skill.getDisplayCategory().getId()))) {

                result.stream()
                        .filter(category -> category.getId().equals(skill.getDisplayCategory().getId()))
                        .findAny()
                        .ifPresent(category -> category.getDisplaySkills().add(skill));
            } else {
                skill.getDisplayCategory().setEnabled(true);
                skill.getDisplayCategory().setIsDisplay(true);
                result.add(skill.getDisplayCategory());
            }
        });
        return result;
    }
}
