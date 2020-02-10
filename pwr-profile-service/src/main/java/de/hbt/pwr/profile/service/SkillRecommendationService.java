package de.hbt.pwr.profile.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import javax.annotation.Nullable;

import de.hbt.pwr.profile.data.ProjectRepository;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.entries.NameEntity;
import de.hbt.pwr.profile.model.profile.entries.Project;

import static java.util.Collections.emptySet;
import static java.util.Optional.ofNullable;

@Service
public class SkillRecommendationService {

    @Autowired
    private ProjectRepository projectRepository;

    private static int YEARS_UNTIL_OUTDATED = 8;

    public Collection<Skill> getRecommendedSkills(@Nullable Project project) {
        return ofNullable(project)
                .map(this::getRecommended)
                .orElseGet(Collections::emptyList);
    }

    private Collection<Skill> getRecommended(Project project) {
        String clientName = ofNullable(project.getClient())
                .map(NameEntity::getName)
                .orElse("");
        String projectName = ofNullable(project.getName())
                .orElse("");
        LocalDate projectDate = ofNullable(project.getStartDate())
                .orElse(LocalDate.now());
        Set<NameEntity> projectRoles = ofNullable(project.getProjectRoles())
                .orElse(emptySet());
        Predicate<Project> relevantProject = projectHasClient()
                .and(onlyProjectsWithClient(clientName).and(onlyProjectsWithSimilarRoles(projectRoles)))
                .or(onlyProjectsWithName(projectName));
        return projectRepository.findAll()
                .stream()
                .filter(relevantProject)
                .filter(onlyRecentProjects(projectDate))
                .map(Project::getSkills)
                .flatMap(Collection::stream)
                .filter(s -> (!project.getSkills().contains(s)))
                .distinct()
                .sorted(Comparator.comparing(Skill::getName))
                .collect(Collectors.toList());
    }

    private Predicate<Project> projectHasClient() {
        return p -> p.getClient() != null;
    }

    private Predicate<Project> onlyProjectsWithSimilarRoles(Collection<NameEntity> projectRoles) {
        return project -> {
            Collection<NameEntity> intersection = new HashSet<>(projectRoles);
            Collection<NameEntity> otherRoles = ofNullable(project.getProjectRoles()).orElse(emptySet());
            intersection.retainAll(otherRoles);
            return !intersection.isEmpty();
        };
    }

    private Predicate<Project> onlyProjectsWithClient(String clientName) {
        return project -> clientName.equals(project.getClient().getName());
    }

    private Predicate<Project> onlyProjectsWithName(String projectName) {
        return project -> {
            return ofNullable(project.getName())
                    .map(s -> s.toUpperCase())
                    .map(s -> projectName.toUpperCase().equals(s))
                    .orElse(false);
        };
    }

    private Predicate<Project> onlyRecentProjects(LocalDate projectDate) {
        return project -> {
            LocalDate endDate = ofNullable(project.getEndDate()).orElse(LocalDate.now());
            return YEARS_UNTIL_OUTDATED > Period.between(endDate, projectDate).getYears();
        };
    }
}
