package de.hbt.pwr.view.service;

import de.hbt.pwr.view.aspects.ViewProfileAutoSave;
import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.client.profile.model.NameEntityType;
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
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Stream;

/**
 * Names of skills and display categories in the language of a view profile (#174), and of the entries from profile
 * elements (#291). The name stays the key; the localization goes into {@link Skill#getLocalizedName()},
 * {@link Category#getLocalizedName()} and {@code localizedName} of the entries, null without a language or without a
 * localization.
 */
@Service
public class ViewProfileLocalizationService {

    private final SkillServiceClient skillServiceClient;
    private final ProfileServiceClient profileServiceClient;

    public ViewProfileLocalizationService(SkillServiceClient skillServiceClient,
                                          ProfileServiceClient profileServiceClient) {
        this.skillServiceClient = skillServiceClient;
        this.profileServiceClient = profileServiceClient;
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
        localizeEntries(viewProfile, language);
    }

    /**
     * The entries from profile elements (#291), found by type and name, ignoring case; companies too, as client and
     * broker of the projects
     */
    private void localizeEntries(ViewProfile viewProfile, String language) {
        Map<String, String> localized = new HashMap<>();
        if (language != null) {
            profileServiceClient.getLocalizations(language).forEach(localization ->
                    localized.put(key(localization.getType(), localization.getName()), localization.getQualifier()));
        }
        Function<NameEntityType, Function<String, String>> in = type -> name -> name == null ? null : localized.get(key(type, name));
        viewProfile.getCareers().forEach(entry -> entry.setLocalizedName(in.apply(NameEntityType.CAREER).apply(entry.getName())));
        viewProfile.getEducations().forEach(entry -> entry.setLocalizedName(in.apply(NameEntityType.EDUCATION).apply(entry.getName())));
        viewProfile.getKeySkills().forEach(entry -> entry.setLocalizedName(in.apply(NameEntityType.SPECIAL_FIELD).apply(entry.getName())));
        viewProfile.getLanguages().forEach(entry -> entry.setLocalizedName(in.apply(NameEntityType.LANGUAGE).apply(entry.getName())));
        viewProfile.getQualifications().forEach(entry -> entry.setLocalizedName(in.apply(NameEntityType.QUALIFICATION).apply(entry.getName())));
        viewProfile.getSectors().forEach(entry -> entry.setLocalizedName(in.apply(NameEntityType.SECTOR).apply(entry.getName())));
        viewProfile.getTrainings().forEach(entry -> entry.setLocalizedName(in.apply(NameEntityType.TRAINING).apply(entry.getName())));
        Function<String, String> role = in.apply(NameEntityType.PROJECT_ROLE);
        Function<String, String> company = in.apply(NameEntityType.COMPANY);
        viewProfile.getProjectRoles().forEach(entry -> entry.setLocalizedName(role.apply(entry.getName())));
        viewProfile.getProjects().forEach(project -> {
            if (project.getProjectRoles() != null) {
                project.getProjectRoles().forEach(entry -> entry.setLocalizedName(role.apply(entry.getName())));
            }
            project.setLocalizedClient(company.apply(project.getClient()));
            project.setLocalizedBroker(company.apply(project.getBroker()));
        });
    }

    private static String key(NameEntityType type, String name) {
        return type + ":" + name.trim().toLowerCase(Locale.ROOT);
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
