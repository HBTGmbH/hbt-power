package de.hbt.pwr.view.service;

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


    @Autowired
    public ViewProfileMergeService(ViewProfileRepository viewProfileRepository, ViewProfileCreatorService viewProfileCreatorService) {

        this.viewProfileRepository = viewProfileRepository;
        this.viewProfileCreatorService = viewProfileCreatorService;
    }

    public ViewProfile updateViewProfile(String oldId, String initials, ViewProfile.ViewProfileMergeOptions options) {
        //1. get old ViewProfile (VP)
        ViewProfile oldView = viewProfileRepository.findById(oldId).orElseThrow(() -> new ViewProfileNotFoundException(oldId));

        // 3. create new ViewProfile
        ViewProfile newView = viewProfileCreatorService.createViewProfile(initials, options.name, options.viewDescription, "");
        return mergeViewProfiles(oldView, newView, options);
    }

    ViewProfile mergeViewProfiles(ViewProfile oldView, ViewProfile newView, ViewProfile.ViewProfileMergeOptions options) {

        newView.getViewProfileInfo().setName(options.name);
        newView.getViewProfileInfo().setViewDescription(options.viewDescription);

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
        newView.setProjects(mergeProjects(oldView.getProjects(), newView.getProjects()));
        // ProjectRoles
        newView.setProjectRoles(mergeEntities(oldView.getProjectRoles(), newView.getProjectRoles()));

        // Display Categories
        newView.setDisplayCategories(mergeDisplayCategories(oldView.getDisplayCategories(), newView.getDisplayCategories()));

        if (!options.keepOld) {
            // delete the old one
            viewProfileRepository.delete(oldView);
        }
        newView = viewProfileRepository.save(newView);
        return newView;
    }

    private List<Project> mergeProjects(List<Project> oldList, List<Project> newList) {
        return newList.stream()
                .map(newProject -> {
                    Optional<Project> maybeOldProject = oldList.stream()
                            .filter(oldProject -> Objects.equals(oldProject.getId(), newProject.getId()))
                            .findAny();
                    return maybeOldProject
                            .map(project -> mergeProject(newProject, project))
                            .orElse(newProject);
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(newProject -> findIndexIn(oldList, newProject)))
                .collect(Collectors.toList());
    }

    private Project mergeProject(Project newProject, Project oldProject) {
        return newProject.toBuilder()
                .projectRoles(mergeProjectRoles(newProject.getProjectRoles(), oldProject.getProjectRoles()))
                .skills(mergeProjectSkills(newProject.getSkills(), oldProject.getSkills()))
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

    private List<Skill> mergeProjectSkills(List<Skill> newSkills, List<Skill> oldSkills) {
        return newSkills.stream()
                .map(newSkill -> {
                    Boolean skillActive = oldSkills.stream()
                            .filter(oldSkill -> Objects.equals(oldSkill.getName(), newSkill.getName()))
                            .findAny()
                            .map(Skill::getEnabled)
                            .orElse(true);
                    return newSkill.toBuilder()
                            .enabled(skillActive)
                            .build();
                })
                .sorted(Comparator.comparing(newProject -> findIndexIn(oldSkills, newProject)))
                .collect(Collectors.toList());
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
