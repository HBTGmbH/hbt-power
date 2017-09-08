package de.hbt.pwr.view.exception;

import de.hbt.pwr.view.model.skill.Category;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Thrown when a {@link Category} was not found.
 * @author nt (nt@hbt.de)
 */
public class CategoryNotFoundException extends RuntimeException {
    @Getter
    private String name;

    public CategoryNotFoundException(String name) {
        super("No category with name '" + name + "' found.");
        this.name = name;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class InnerError {
        private final String code = "ParentNotFound";
        private final String restriction = "Parent must exist in the category tree";
        private String targetName;
    }
}
