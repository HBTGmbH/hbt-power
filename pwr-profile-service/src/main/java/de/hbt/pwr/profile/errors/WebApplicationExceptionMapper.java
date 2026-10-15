package de.hbt.pwr.profile.errors;

import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.stream.Collectors;

import static org.apache.logging.log4j.LogManager.getLogger;

/**
 * This Mapper catches all WebApplicationExceptions (including subclasses, e.g. NotFoundException) so that a JSON error message is generated.
 * <p>
 * Created by cg on 13.04.2017.
 */
@ControllerAdvice
public class WebApplicationExceptionMapper extends ResponseEntityExceptionHandler {


    private static final Logger LOG = getLogger(WebApplicationExceptionMapper.class);

    @Value("${isPolite}")
    private static boolean isPolite = true;

    public WebApplicationExceptionMapper() {
    }

    @ExceptionHandler(value = {WebApplicationException.class})
    public ResponseEntity toResponse(WebApplicationException e) {
        LOG.error("Caught WAE, generating HTTP response with message.", e);
        String msg;
        if (isPolite) {
            msg = "We a sorry to tell you, but your request was problematic for us: ";
            msg += e.getMessage();
            msg += ". We are so terribly sorry for your inconvenience.";
        } else {
            msg = e.getMessage();
        }

        return ResponseEntity
                .status(e.getStatus())
                .body(new ErrorInfo(e.getStatus().value(), e.getStatus().getReasonPhrase(), msg, ""));
    }

    @ExceptionHandler(value = {PwrValidationException.class})
    public ResponseEntity<ErrorInfo> toResponse(PwrValidationException e) {
        String messages = e.getMessages().stream().collect(Collectors.joining("\n"));
        ErrorInfo errorInfo = new ErrorInfo(400, "Validation failed", messages, "");
        return ResponseEntity.status(errorInfo.getStatus())
                .body(errorInfo);
    }
}
