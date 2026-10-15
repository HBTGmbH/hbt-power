package de.hbt.power.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class SkillServiceExceptionHandler {

    @ExceptionHandler(value = {SkillServiceException.class})
    public ResponseEntity<SkillServiceError> handleInvalidOwner(SkillServiceException skillServiceException) {
        SkillServiceError error = skillServiceException.toError();
        return ResponseEntity.status(error.getErrorType().getStatus()).body(error);
    }

}
