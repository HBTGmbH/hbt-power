package de.hbt.pwr.view.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class ViewProfileExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = {InvalidOwnerException.class})
    public ResponseEntity<InvalidOwnerException.Error> handleInvalidOwner(InvalidOwnerException invalidOwnerException){
        String viewProfileId = invalidOwnerException.getViewProfileId();
        String initials = invalidOwnerException.getInitials();
        String message = invalidOwnerException.getMessage();
        InvalidOwnerException.InnerError innerError = new InvalidOwnerException.InnerError(viewProfileId, initials);
        InvalidOwnerException.OuterError outerError = new InvalidOwnerException.OuterError(message, viewProfileId, innerError);
        InvalidOwnerException.Error error = new InvalidOwnerException.Error(outerError);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(value = ViewProfileNotFoundException.class)
    public ResponseEntity<ViewProfileNotFoundException.Error> handleViewProfileNotFound(ViewProfileNotFoundException viewProfileNotFoundException) {
        String viewProfileId = viewProfileNotFoundException.getViewProfileId();
        String message = viewProfileNotFoundException.getMessage();
        ViewProfileNotFoundException.InnerError innerError = new ViewProfileNotFoundException.InnerError(viewProfileId);
        ViewProfileNotFoundException.OuterError outerError = new ViewProfileNotFoundException.OuterError(message, viewProfileId, innerError);
        ViewProfileNotFoundException.Error error = new ViewProfileNotFoundException.Error(outerError);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(value = DisplayCategoryNotFoundException.class)
    public ResponseEntity<DisplayCategoryNotFoundException.Error> handleDisplayCategoryNotFound(DisplayCategoryNotFoundException displayCategoryNotFoundException) {
        DisplayCategoryNotFoundException.InnerError innerError = new DisplayCategoryNotFoundException.InnerError(
                displayCategoryNotFoundException.getViewProfileId(),
                displayCategoryNotFoundException.getSkillName(),
                displayCategoryNotFoundException.getWantedCategory());
        DisplayCategoryNotFoundException.OuterError outerError = new DisplayCategoryNotFoundException.OuterError(
                displayCategoryNotFoundException.getMessage(),
                displayCategoryNotFoundException.getViewProfileId(),
                innerError
        );
        DisplayCategoryNotFoundException.Error error = new DisplayCategoryNotFoundException.Error(outerError);
        return ResponseEntity.badRequest().body(error);
    }
}
