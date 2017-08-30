package de.hbt.pwr.view.exception;

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


    private String viewProfileId;

    private String initials;

    public InvalidOwnerException(String viewProfileId, String initials) {
        super("The consultant " + initials + " does not own the view profile with id=" + viewProfileId);
        this.viewProfileId = viewProfileId;
        this.initials = initials;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class InnerError {
        private final String error = "InvalidOwner";
        private String viewProfileId;
        private String initials;
    }
}
