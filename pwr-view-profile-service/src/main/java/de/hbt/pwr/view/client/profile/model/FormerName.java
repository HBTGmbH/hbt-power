package de.hbt.pwr.view.client.profile.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A former name of a renamed or merged profile element and its current name (#230)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormerName {
    private NameEntityType type;
    private String name;
    private String currentName;
}
