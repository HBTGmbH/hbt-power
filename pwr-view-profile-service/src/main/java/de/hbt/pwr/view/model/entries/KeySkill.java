package de.hbt.pwr.view.model.entries;

import de.hbt.pwr.view.model.entries.sort.NameComparable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(exclude = "localizedName")
@Builder
public class KeySkill implements ToggleableEntry, NameComparable {
    private String name;
    private Boolean enabled;

    /**
     * The name in the language of the view profile (#291), if the profile element has a localization for it; the name
     * stays the key. Filled by {@link de.hbt.pwr.view.service.ViewProfileLocalizationService}.
     */
    private String localizedName;
}
