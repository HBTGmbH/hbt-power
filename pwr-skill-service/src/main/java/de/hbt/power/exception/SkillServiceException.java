package de.hbt.power.exception;

import de.hbt.power.model.Skill;
import de.hbt.power.model.SkillCategory;
import lombok.Getter;
import lombok.Setter;

import static de.hbt.power.exception.SkillServiceErrorType.*;
import static java.lang.String.format;

@Getter
@Setter
public class SkillServiceException extends RuntimeException {
    private SkillServiceErrorType skillServiceErrorType;

    private String message;

    private Integer id;

    private SkillServiceException(SkillServiceErrorType skillServiceErrorType, String message, Integer id) {
        this.skillServiceErrorType = skillServiceErrorType;
        this.message = message;
        this.id = id;
    }

    SkillServiceError toError() {
        return new SkillServiceError(id, skillServiceErrorType, message);
    }

    public static SkillServiceException skillAlreadyExists(Skill skill) {
        String message = "Skill " + skill.getQualifier() + " already exists!";
        return new SkillServiceException(ERR_SKILL_ALREADY_EXISTS, message, skill.getId());
    }

    public static SkillServiceException skillNotFound(Integer id) {
        String message = "No skill for ID " + id + " found.";
        return new SkillServiceException(ERR_SKILL_NOT_FOUND, message, id);
    }

    public static SkillServiceException skillNotFound(String qualifier) {
        String message = "No skill for qualifier '" + qualifier + "' found.";
        return new SkillServiceException(ERR_SKILL_NOT_FOUND, message, null);
    }

    public static SkillServiceException categoryNotFound(String qualifier) {
        String message = "No skill category for qualifier '" + qualifier + "' found.";
        return new SkillServiceException(ERR_CATEGORY_NOT_FOUND, message, null);
    }

    public static SkillServiceException validationFailed(String field, String cause) {
        String message = format("Request validation of %s failed with reason: %s", field, cause);
        return new SkillServiceException(ERR_VALIDATION_FAILED, message, null);
    }

    public static SkillServiceException categoryNotFound(Integer id) {
        String message = "No skill category for ID " + id + " found.";
        return new SkillServiceException(ERR_CATEGORY_NOT_FOUND, message, id);
    }

    public static SkillServiceException invalidCategoryQualifier(String qualifier) {
        String message = "Invalid category qualifier '" + qualifier + "'. Qualifiers must at least be one character long and not null";
        return new SkillServiceException(ERR_INVALID_CATEGORY_QUALIFIER, message, null);
    }

    public static SkillServiceException categoryAlreadyExists(SkillCategory category) {
        String message = "Category " + category.getQualifier() + " already exists.";
        return new SkillServiceException(ERR_CATEGORY_ALREADY_EXISTS, message, category.getId());
    }

    public static SkillServiceException categoryCantBeMoved(SkillCategory category) {
        String message = "Category " + category.getQualifier() + " moving is forbidden.";
        return new SkillServiceException(ERR_CATEGORY_MOVE_FORBIDDEN, message, category.getId());
    }

    public static SkillServiceException categoryCantBeDeleted(SkillCategory category) {
        String message = "Category " + category.getQualifier() + " deletion is forbidden.";
        return new SkillServiceException(ERR_CATEGORY_DELETE_FORBIDDEN, message, category.getId());
    }

}
