package de.hbt.pwr.view.util;

import de.hbt.pwr.view.client.profile.model.*;
import de.hbt.pwr.view.client.skill.model.SkillServiceCategory;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.model.entries.*;
import de.hbt.pwr.view.model.skill.Category;
import de.hbt.pwr.view.model.skill.Skill;
import org.jetbrains.annotations.NotNull;


/**
 * Created by nt on 30.08.2017.
 */
public class ModelConvertUtil {
    @NotNull
    public static Language mapLanguage(@NotNull LanguageSkill languageSkill) {
        return Language.builder().enabled(true).level(languageSkill.getLevel())
                .name(languageSkill.getNameEntity().getName()) // TODO check uniqueness and check null
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
        return Education.builder().degree(educationEntry.getDegree()).enabled(true).endDate(educationEntry.getEndDate())
                .name(educationEntry.getNameEntity().getName()).startDate(educationEntry.getStartDate()).build();
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
    public static Category mapCategory(SkillServiceCategory skillServiceCategory) {
        Category category = new Category();
        category.setName(skillServiceCategory.getQualifier());
        category.setIsDisplay(false);
        category.setEnabled(true);
        if(skillServiceCategory.getCategory() != null) {
            category.setParent(mapCategory(skillServiceCategory.getCategory()));
        }
        return category;
    }

    @NotNull
    public static Skill mapSkill(SkillServiceSkill skillServiceSkill) {
        Skill skill = new Skill();
        skill.setEnabled(true);
        skill.setName(skillServiceSkill.getQualifier());
        if(skillServiceSkill.getCategory() != null) {
            Category category = mapCategory(skillServiceSkill.getCategory());
            skill.setCategory(category);
        }
        return skill;
    }

}
