package de.hbt.pwr.view.model.skill;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A category of the skill tree the skills of a display category can move to (#171), in the order of the tree
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DisplayCategoryTarget {
    private Long id;
    private String name;
    /** Levels below the highest category of the skills, 0 for the highest */
    private int depth;
    /** Skills of the display category that hang at or below this category in the skill tree */
    private int skills;
    /** All skills of the display category */
    private int of;
    /** The display category itself */
    private boolean current;
}
