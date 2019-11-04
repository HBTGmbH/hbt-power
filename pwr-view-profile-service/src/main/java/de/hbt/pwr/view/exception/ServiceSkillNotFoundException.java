package de.hbt.pwr.view.exception;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class ServiceSkillNotFoundException extends RuntimeException{
    @Getter
    private final String name;

    public ServiceSkillNotFoundException(String name) {
        super("No ServiceSkill with name '" + name + "' found.");
        this.name = name;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class InnerError {

        private static final String CODE = "ParentNotFound";
        private static final String RESTRICTION = "Parent must exist in the category tree";
        private String targetName;

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
