package de.hbt.pwr.view.exception;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    private final String viewProfileId;

    public ViewProfileNotFoundException(String viewProfileId) {
        super("The given id (" + viewProfileId + ") did not match a view profile.");
        this.viewProfileId = viewProfileId;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class InnerError {
        private static final String CODE = "ViewNotFound";
        private String viewProfileId;

        @JsonProperty("code")
        public String getCode() {
            return CODE;
        }
    }

}
