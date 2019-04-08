package de.hbt.power.exception;

/**
 * General Skill Service error that is used for external communication. Whenever a business exception occurs, it
 * is mapped to this exception.
 * <p>
 * This is used to allow the webclient (and any form of API consumer) an automated way of processing these exceptions.
 * </p>
 */
public class SkillServiceError {
    private Integer id;
    private SkillServiceErrorType errorType;
    private String message;

    SkillServiceError(Integer id, SkillServiceErrorType errorType, String message) {
        this.id = id;
        this.errorType = errorType;
        this.message = message;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public SkillServiceErrorType getErrorType() {
        return errorType;
    }

    public void setErrorType(SkillServiceErrorType errorType) {
        this.errorType = errorType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
