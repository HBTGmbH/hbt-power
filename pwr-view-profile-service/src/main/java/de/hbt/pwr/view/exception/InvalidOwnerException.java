package de.hbt.pwr.view.exception;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Constructs an exception that translates into a 404 status code
 * indicating that the requested view profile does not belong to the
 * provided consultant.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class InvalidOwnerException extends RuntimeException {


    private final String viewProfileId;

    private final String initials;

    public InvalidOwnerException(String viewProfileId, String initials) {
        super("The consultant " + initials + " does not own the view profile with id=" + viewProfileId);
        this.viewProfileId = viewProfileId;
        this.initials = initials;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class InnerError {
        private static final String CODE = "InvalidOwner";
        private String viewProfileId;
        private String initials;

        @JsonProperty("code")
        public String getCode() {
            return CODE;
        }
    }

}
