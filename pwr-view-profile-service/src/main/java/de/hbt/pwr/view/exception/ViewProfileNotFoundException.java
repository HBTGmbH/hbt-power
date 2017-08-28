package de.hbt.pwr.view.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * Exception that indicates that the requested view profile id
 * does not represent a view profile.
 * @author nt / nt@hbt.de
 * @since 26.09.2017
 */
public class ViewProfileNotFoundException extends RuntimeException {

    @Getter
    private String viewProfileId;

    public ViewProfileNotFoundException(String viewProfileId) {
        super("The given id (" + viewProfileId + ") did not match a view profile.");
        this.viewProfileId = viewProfileId;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Error {
        private OuterError error;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class OuterError {
        private final int code = HttpStatus.FORBIDDEN.value();
        private String message;
        private String target;
        private InnerError innerError;
    }


    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class InnerError {
        private final String error = "ViewNotFound";
        private String viewProfileId;
    }

}
