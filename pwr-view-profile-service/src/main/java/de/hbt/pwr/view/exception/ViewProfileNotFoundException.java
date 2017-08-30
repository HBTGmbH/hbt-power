package de.hbt.pwr.view.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
    static class InnerError {
        private final String error = "ViewNotFound";
        private String viewProfileId;
    }

}
