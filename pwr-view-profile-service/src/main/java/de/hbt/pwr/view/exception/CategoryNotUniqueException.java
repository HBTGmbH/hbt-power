package de.hbt.pwr.view.exception;

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
    private String newName;

    public CategoryNotUniqueException(String newName) {
        super("A category with the name " + newName + " already exists.");
        this.newName = newName;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class InnerError {
        private final String code = "CategoryNotUnique";
        private final String restriction = "Category must be unique in the whole view profile";
        private String targetName;
    }
}
