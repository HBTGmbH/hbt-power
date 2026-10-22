package de.hbt.pwr.view.service;

import de.hbt.pwr.view.aspects.ViewProfileAutoSave;
import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.model.LocalizedQualifier;
import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.Project;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

/**
 * Names of skills and display categories in the language of a view profile (#174). The name of the skill tree stays the
 * key of a skill or category; the localization goes into {@link Skill#getLocalizedName()} and
 * {@link Category#getLocalizedName()}, null without a language or without a localization.
 */
@Service
public class ViewProfileLocalizationService {

    private final SkillServiceClient skillServiceClient;

    public ViewProfileLocalizationService(SkillServiceClient skillServiceClient) {
        this.skillServiceClient = skillServiceClient;
    }

    /**
     * Sets the language of the names (#174), null or blank for the names of the skill tree, and fills them
     */
    @ViewProfileAutoSave
    public ViewProfile setLocalization(ViewProfile viewProfile, String language) {
        viewProfile.setLocalization(language == null || language.isBlank() ? null : language.trim());
        localize(viewProfile);
        return viewProfile;
    }

    /**
     * The localization of the given language, if there is one
     */
    public static String localizedName(List<LocalizedQualifier> qualifiers, String language) {
        if (language == null || qualifiers == null) {
            return null;
        }
        return qualifiers.stream()
                .filter(qualifier -> language.equals(qualifier.getLocale()))
                .map(LocalizedQualifier::getQualifier)
                .filter(name -> name != null && !name.isBlank())
                .findFirst()
                .orElse(null);
    }

    /**
     * Fills the localized names of all skills (display categories and projects) and display categories with the
     * current localizations of the skill tree, or clears them without a language. Doesn't save.
     */
    public void localize(ViewProfile viewProfile) {
        String language = viewProfile.getLocalization();
        Map<String, Optional<SkillServiceSkill>> skillsByName = new HashMap<>();
        Map<Long, SkillServiceCategory> categoriesById = new HashMap<>();
        allSkills(viewProfile).forEach(skill -> {
            Optional<SkillServiceSkill> serviceSkill = language == null
                    ? Optional.empty()
                    : skillsByName.computeIfAbsent(skill.getName(), this::findSkill);
            serviceSkill.ifPresent(found -> collectCategories(found.getCategory(), categoriesById));
            skill.setLocalizedName(serviceSkill.map(found -> localizedName(found.getQualifiers(), language)).orElse(null));
        });
        viewProfile.getDisplayCategories().forEach(category -> {
            SkillServiceCategory serviceCategory = category.getId() == null ? null : categoriesById.get(category.getId());
            category.setLocalizedName(serviceCategory == null ? null : localizedName(serviceCategory.getQualifiers(), language));
        });
    }

    private Stream<Skill> allSkills(ViewProfile viewProfile) {
        Stream<Skill> displaySkills = viewProfile.getDisplayCategories().stream()
                .flatMap(category -> category.getDisplaySkills().stream());
        Stream<Skill> projectSkills = viewProfile.getProjects().stream()
                .map(Project::getSkills)
                .filter(skills -> skills != null)
                .flatMap(List::stream);
        return Stream.concat(displaySkills, projectSkills);
    }

    private Optional<SkillServiceSkill> findSkill(String name) {
        return Optional.ofNullable(skillServiceClient.getSkillByName(name));
    }

    private static void collectCategories(SkillServiceCategory category, Map<Long, SkillServiceCategory> categoriesById) {
        for (SkillServiceCategory current = category; current != null; current = current.getCategory()) {
            if (current.getId() != null) {
                categoriesById.putIfAbsent(current.getId().longValue(), current);
            }
        }
    }
}
