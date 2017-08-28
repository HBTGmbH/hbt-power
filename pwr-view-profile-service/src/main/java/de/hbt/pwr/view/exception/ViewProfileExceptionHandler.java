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
    public ResponseEntity<String> handleInvalidOwner(InvalidOwnerException invalidOwnerException){
        ObjectMapper objectMapper = new ObjectMapper();

        ObjectNode inerror = objectMapper.createObjectNode();
        inerror.put("error", "InvalidOwner");
        inerror.put("viewProfileId", invalidOwnerException.getViewProfileId());
        inerror.put("initials", invalidOwnerException.getInitials());

        ObjectNode objectNode = objectMapper.createObjectNode();
        objectNode.put("code", HttpStatus.FORBIDDEN.value());
        objectNode.put("message", invalidOwnerException.getMessage());
        objectNode.put("target", invalidOwnerException.getViewProfileId());
        objectNode.set("innererror", inerror);

        ObjectNode error = objectMapper.createObjectNode();
        error.set("error", objectNode);

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error.toString());
    }

    @ExceptionHandler(value = ViewProfileNotFoundException.class)
    public ResponseEntity<String> handleViewProfileNotFound(ViewProfileNotFoundException viewProfileNotFoundException) {
        ObjectMapper objectMapper = new ObjectMapper();

        ObjectNode innerError = objectMapper.createObjectNode();
        innerError.put("viewProfileId", viewProfileNotFoundException.getViewProfileId());
        innerError.put("code", "ViewNotFound");

        ObjectNode outerError = objectMapper.createObjectNode();
        outerError.put("code", HttpStatus.NOT_FOUND.value());
        outerError.put("message", viewProfileNotFoundException.getMessage());
        outerError.put("target", viewProfileNotFoundException.getViewProfileId());
        outerError.set("innererror", innerError);

        ObjectNode error = objectMapper.createObjectNode();
        error.set("error", outerError);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error.toString());
    }
}
