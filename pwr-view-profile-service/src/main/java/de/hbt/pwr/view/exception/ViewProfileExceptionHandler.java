package de.hbt.pwr.view.exception;

import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.skill.Category;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class ViewProfileExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = {InvalidOwnerException.class})
    public ResponseEntity<ServiceError> handleInvalidOwner(InvalidOwnerException invalidOwnerException){
        String viewProfileId = invalidOwnerException.getViewProfileId();
        String initials = invalidOwnerException.getInitials();
        String message = invalidOwnerException.getMessage();

        InvalidOwnerException.InnerError innerError = new InvalidOwnerException.InnerError(viewProfileId, initials);
        ServiceOuterError outerError = new ServiceOuterError(HttpStatus.FORBIDDEN.toString(), message, ViewProfile.class.toString(), innerError);
        ServiceError error = new ServiceError(outerError);

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(value = ViewProfileNotFoundException.class)
    public ResponseEntity<ServiceError> handleViewProfileNotFound(ViewProfileNotFoundException viewProfileNotFoundException) {
        String viewProfileId = viewProfileNotFoundException.getViewProfileId();
        String message = viewProfileNotFoundException.getMessage();
        HttpStatus status = HttpStatus.NOT_FOUND;

        ViewProfileNotFoundException.InnerError innerError = new ViewProfileNotFoundException.InnerError(viewProfileId);
        ServiceOuterError outerError = new ServiceOuterError(status.toString(), message, ViewProfile.class.toString(), innerError);
        ServiceError serviceError = new ServiceError(outerError);

        return ResponseEntity.status(status).body(serviceError);
    }

    @ExceptionHandler(value = DisplayCategoryNotFoundException.class)
    public ResponseEntity<ServiceError> handleDisplayCategoryNotFound(DisplayCategoryNotFoundException displayCategoryNotFoundException) {
        final HttpStatus status = HttpStatus.BAD_REQUEST;
        final String message = displayCategoryNotFoundException.getMessage();

        DisplayCategoryNotFoundException.InnerError innerError = new DisplayCategoryNotFoundException.InnerError(
                displayCategoryNotFoundException.getViewProfileId(),
                displayCategoryNotFoundException.getSkillName(),
                displayCategoryNotFoundException.getWantedCategory());
        ServiceOuterError outerError = new ServiceOuterError(status.toString(), message, Category.class.toString(), innerError);
        ServiceError serviceError = new ServiceError(outerError);

        return ResponseEntity.badRequest().body(serviceError);
    }

    @ExceptionHandler(value = CategoryNotUniqueException.class)
    public ResponseEntity<ServiceError> handleCategoryNotUnique(CategoryNotUniqueException exception) {
        final HttpStatus status = HttpStatus.CONFLICT;
        CategoryNotUniqueException.InnerError innerError = new CategoryNotUniqueException.InnerError(exception.getNewName());
        ServiceOuterError serviceOuterError = new ServiceOuterError(status.toString(), exception.getMessage(), Category.class.toString(), innerError);
        ServiceError serviceError = new ServiceError(serviceOuterError);
        return ResponseEntity.status(status).body(serviceError);
    }

    @ExceptionHandler(value = CategoryNotFoundException.class)
    public ResponseEntity<ServiceError> handleCategoryNotFound(CategoryNotFoundException exception) {
        final HttpStatus status = HttpStatus.BAD_REQUEST;
        CategoryNotFoundException.InnerError innerError = new CategoryNotFoundException.InnerError(exception.getName());
        ServiceOuterError serviceOuterError = new ServiceOuterError(status.toString(), exception.getMessage(), Category.class.toString(), innerError);
        ServiceError serviceError = new ServiceError(serviceOuterError);
        return ResponseEntity.status(status).body(serviceError);
    }
}
