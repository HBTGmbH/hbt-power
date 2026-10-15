package de.hbt.pwr.view.exception;

import com.fasterxml.jackson.annotation.JsonProperty;
import de.hbt.pwr.view.model.skill.Category;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Defines an exception where a provided {@link Category} is not unique in
 * a  {@link Category} tree, meaning that {@link Category#getChildren()} of the root
 * category recursively contains a category with the same name or the root category itself
 * has the same name.
 * @author nt (nt@hbt.de)
 */
public class CategoryNotUniqueException extends RuntimeException {
    @Getter
    private final String newName;

    public CategoryNotUniqueException(String newName) {
        super("A category with the name " + newName + " already exists.");
        this.newName = newName;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class InnerError {
        private static final String CODE = "CategoryNotUnique";
        private static final String RESTRICTION = "Category must be unique in the whole view profile";
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
