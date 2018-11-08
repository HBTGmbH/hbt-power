package de.hbt.pwr.view.exception;

import de.hbt.pwr.view.client.profile.model.Profile;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.skill.Category;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Handles exceptions that represent a service tier layer problem that was caused by faulty input. These exceptions
 * need to be forwarded to the service user in a standardized way.
 * <p>
 *     Each exception is mapped to an {@link ServiceOuterError} object that wraps general information about
 *     the problem in a {@link ServiceError} object. These two objects represent a machine interpretable form
 *     of the problem. To give potential developer better feedback, an inner error object exists for each mappable
 *     exception. These inner errors describe the cause of the problem in a human readable format.
 * </p>
 * <p>
 *     Note that only exceptions that represent actual misuse of the service need to be mapped in this format. General
 *     exceptions will use springs default exception mapper (such as nullpointer exceptions)
 * </p>
 * @see <a href="https://github.com/Microsoft/api-guidelines/blob/vNext/Guidelines.md#710-response-formats">Microsoft API Guidelines</a>
 * @author nt (nt@hbt.de)
 */
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

    @ExceptionHandler(value = NoProfileAvailableException.class)
    public ResponseEntity<ServiceError> handleNoProfileAvailable(NoProfileAvailableException exception) {
        final HttpStatus status = HttpStatus.BAD_REQUEST;
        NoProfileAvailableException.InnerError innerError = new NoProfileAvailableException.InnerError(exception.getInitials());
        ServiceOuterError outerError = new ServiceOuterError(status.toString(), exception.getMessage(), Profile.class.toString(), innerError);
        ServiceError serviceError = new ServiceError(outerError);
        return ResponseEntity.status(status).body(serviceError);
    }

    @ExceptionHandler(value = TemplateNotFoundException.class)
    public ResponseEntity<ServiceError> handleTemplateIdNotFound(TemplateNotFoundException exception) {
        final HttpStatus status = HttpStatus.NOT_FOUND;
        TemplateNotFoundException.InnerError innerError = new TemplateNotFoundException.InnerError(exception.getTemplateId());
        ServiceOuterError outerError = new ServiceOuterError(status.toString(), exception.getMessage(), ReportTemplate.class.toString(), innerError);
        ServiceError serviceError = new ServiceError(outerError);
        return ResponseEntity.status(status).body(serviceError);
    }
}
