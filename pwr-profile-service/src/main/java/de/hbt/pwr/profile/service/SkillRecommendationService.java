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
                .orElse(new HashSet<>());
        return projectRepository.findAll()
                .stream()
                .filter(projectHasClient().and(onlyProjectsWithClient(clientName).and(onlyProjectsWithSimilarRoles(projectRoles)))
                        .or(onlyProjectsWithName(projectName)))
                .filter(onlyRecentProjects(projectDate))
                .map(Project::getSkills)
                .flatMap(Collection::stream)
                .filter(s -> (!project.getSkills().contains(s)))
                .distinct()
                .collect(Collectors.toList());
    }

    private Predicate<Project> projectHasClient() {
        return p -> p.getClient() != null;
    }

    private Predicate<Project> onlyProjectsWithSimilarRoles(Collection<NameEntity> projectRoles) {
        return project -> {
            Collection<NameEntity> otherRoles = ofNullable(project.getProjectRoles()).orElse(new HashSet<>())
                , intersection = new HashSet<>(projectRoles);
            intersection.retainAll(otherRoles);
            return !intersection.isEmpty();
        };
    }

    private Predicate<Project> onlyProjectsWithClient(String clientName) {
        return project -> clientName.equals(project.getClient().getName());
    }

    private Predicate<Project> onlyProjectsWithName(String projectName) {
        return project -> projectName.equals(project.getName());
    }

    private Predicate<Project> onlyRecentProjects(LocalDate projectDate) {
        return project -> YEARS_UNTIL_OUTDATED >
                            Period.between(
                            ofNullable(project.getEndDate()).orElse(LocalDate.now())
                            , projectDate)
                            .getYears();
    }
}
