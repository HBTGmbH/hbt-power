package de.hbt.pwr.view.exception;

import de.hbt.pwr.view.client.profile.model.Profile;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Describes an error where the given initials could not get resolved into a {@link  Profile}, either because
 * the initials did not represent a consultant or because of a network error.
 * @author nt (nt@hbt.de)
 */
public class NoProfileAvailableException extends RuntimeException {
    @Getter
    private String initials;

    public NoProfileAvailableException(String initials) {
        super("No profile available for " + initials);
        this.initials = initials;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class InnerError {
        private final String code = "ProfileNotFound";
        private final String restriction = "Initials must represent an existing consultant";
        private String initials;
    }
}
