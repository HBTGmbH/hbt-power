package de.hbt.pwr.view.exception;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    private final String initials;

    public NoProfileAvailableException(String initials) {
        super("No profile available for " + initials);
        this.initials = initials;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class InnerError {
        private static final String CODE = "ProfileNotFound";
        private static final String RESTRICTION = "Initials must represent an existing consultant";
        private String initials;

        @JsonProperty("code")
        public String getCode() {
            return CODE;
        }

        @JsonProperty("restriction")
        public String getRestriction() {
            return RESTRICTION;
        }
    }
}
