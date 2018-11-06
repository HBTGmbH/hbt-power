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
public class TemplateNotFoundException extends RuntimeException {

    @Getter
    private final String templateId;

    public TemplateNotFoundException(String templateId) {
        super("The given id (" + templateId + ") did not match a view profile.");
        this.templateId = templateId;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class InnerError {
        private static final String CODE = "ViewNotFound";
        private String templateId;

        @JsonProperty("code")
        public String getCode() {
            return CODE;
        }
    }

}
