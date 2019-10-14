package de.hbt.pwr.profile.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
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

    public Collection<Skill> getRecommendedSkills(@Nullable Project project) {
        return ofNullable(project)
                .map(this::getRecommended)
                .orElseGet(Collections::emptyList);
    }

    private Collection<Skill> getRecommended(Project project) {
        String clientName = ofNullable(project.getClient())
                .map(NameEntity::getName)
                .orElse("");
        return  projectRepository.findAll()
                .stream()
                .filter(p -> p.getClient() != null)
                .filter(onlyProjectsWithClient(clientName))
                .map(Project::getSkills)
                .flatMap(Collection::stream)
                .distinct()
                .collect(Collectors.toList());
    }


    private Predicate<Project> onlyProjectsWithClient(String clientName) {
        return project -> clientName.equals(project.getClient().getName());
    }
}
