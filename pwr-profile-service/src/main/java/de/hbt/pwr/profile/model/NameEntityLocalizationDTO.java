package de.hbt.pwr.profile.model;

import de.hbt.pwr.profile.model.profile.NameEntityType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The name of a profile element in a language (#291): type and name say which element, the view-profile service
 * finds its entries by them
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NameEntityLocalizationDTO {
    private NameEntityType type;
    private String name;
    private String language;
    private String qualifier;
}
