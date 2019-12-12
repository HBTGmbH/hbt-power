package de.hbt.pwr.view.util;

import de.hbt.pwr.view.client.profile.model.*;
import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.model.entries.*;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import org.apache.commons.lang.StringUtils;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static de.hbt.pwr.view.service.ViewProfileCreatorService.PWR_ROOT_NAME;


/**
 * Utility methods to convert between the various data models this service consumes.
 *
 * @author nt (nt@hbt.de) on 30.08.2017.
 */
public class ModelConvertUtil {

    private ModelConvertUtil() {
        // Default empty to prevent instantiation
    }

    @NotNull
    public static Language mapLanguage(@NotNull LanguageSkill languageSkill) {
        return Language.builder().enabled(true).level(languageSkill.getLevel())
                .name(languageSkill.getNameEntity().getName())
                .build();
    }

    @NotNull
    public static Qualification mapQualification(@NotNull QualificationEntry qualificationEntry) {
        return Qualification.builder().enabled(true).date(qualificationEntry.getDate())
                .name(qualificationEntry.getNameEntity().getName())
                .build();
    }

    @NotNull
    public static Training mapTraining(@NotNull StepEntry stepEntry) {
        return Training.builder().enabled(true).startDate(stepEntry.getStartDate()).endDate(stepEntry.getEndDate())
                .name(stepEntry.getNameEntity().getName()).build();
    }

    @NotNull
    public static Education mapEducation(@NotNull EducationEntry educationEntry) {
        return Education.builder()
                .degree(StringUtils.defaultString(educationEntry.getDegree()))
                .enabled(true)
                .endDate(educationEntry.getEndDate())
                .name(educationEntry.getNameEntity().getName())
                .startDate(educationEntry.getStartDate()).build();
    }

    @NotNull
    public static Sector mapSector(@NotNull ProfileEntry profileEntry) {
        return Sector.builder().enabled(true).name(profileEntry.getNameEntity().getName()).build();
    }

    @NotNull
    public static Career mapCareer(@NotNull StepEntry stepEntry) {
        return Career.builder().enabled(true).name(stepEntry.getNameEntity().getName())
                .startDate(stepEntry.getStartDate()).endDate(stepEntry.getEndDate()).build();
    }

    @NotNull
    public static KeySkill mapKeySkill(@NotNull ProfileEntry profileEntry) {
        return KeySkill.builder().enabled(true).name(profileEntry.getNameEntity().getName()).build();
    }

    @NotNull
    public static ProjectRole mapProjectRole(@NotNull NameEntity nameEntity) {
        return ProjectRole.builder().enabled(true).name(nameEntity.getName()).build();
    }

    @NotNull
    public static Skill mapFlatSkill(@NotNull ProfileSkill skill) {
        return Skill.builder().name(skill.getName()).rating(skill.getRating()).enabled(true).build();
    }

    @NotNull
    private static Category mapCategory(SkillServiceCategory skillServiceCategory, String locale) {
        Category category = new Category();
        category.setId(skillServiceCategory.getId() != null ? skillServiceCategory.getId().longValue() : -1);
        category.setName(skillServiceCategory.getLocalizedQualifier(locale));
        category.setIsDisplay(skillServiceCategory.getDisplay());
        category.setEnabled(true);
        return category;
    }

    /**
     * Maps a skill so that a partial skill tree with all parents mapped is created.
     */
    @NotNull
    public static Skill mapSkill(SkillServiceSkill skillServiceSkill, ProfileSkill profileSkill, String locale) {
        Skill skill = new Skill();
        skill.setId(skillServiceSkill.getId() != null ? skillServiceSkill.getId().longValue() : -1);
        skill.setEnabled(true);
        skill.setName(skillServiceSkill.getQualifier());
        skill.setRating(profileSkill.getRating());
        return skill;
    }



}
