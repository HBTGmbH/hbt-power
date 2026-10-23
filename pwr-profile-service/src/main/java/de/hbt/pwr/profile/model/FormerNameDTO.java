package de.hbt.pwr.profile.model;

import de.hbt.pwr.profile.model.profile.NameEntityType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A former name of a profile element and its current name (#230)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormerNameDTO {
    private NameEntityType type;
    private String name;
    private String currentName;
}
