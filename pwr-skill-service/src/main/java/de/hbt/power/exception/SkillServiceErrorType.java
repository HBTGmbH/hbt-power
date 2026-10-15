package de.hbt.power.exception;

import org.springframework.http.HttpStatus;

public enum SkillServiceErrorType {
    ERR_CATEGORY_MOVE_FORBIDDEN(HttpStatus.CONFLICT),
    ERR_CATEGORY_DELETE_FORBIDDEN(HttpStatus.CONFLICT),
    ERR_CATEGORY_ALREADY_EXISTS(HttpStatus.CONFLICT),
    ERR_INVALID_CATEGORY_QUALIFIER(HttpStatus.BAD_REQUEST),
    ERR_CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND),
    ERR_SKILL_NOT_FOUND(HttpStatus.NOT_FOUND),
    ERR_SKILL_ALREADY_EXISTS(HttpStatus.CONFLICT),
    ERR_VALIDATION_FAILED(HttpStatus.BAD_REQUEST);

    private final HttpStatus status;

    SkillServiceErrorType(HttpStatus status) {
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
