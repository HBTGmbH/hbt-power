package de.hbt.pwr.view.model.entries;

import de.hbt.pwr.view.model.LanguageLevel;
import de.hbt.pwr.view.model.entries.sort.NameComparable;
import lombok.*;

@Data
@EqualsAndHashCode(exclude = "localizedName")
@Builder
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@AllArgsConstructor
public class Language implements ToggleableEntry, NameComparable {
    private String name;
    private LanguageLevel level;
    private Boolean enabled;

    /**
     * The name in the language of the view profile (#291), if the profile element has a localization for it; the name
     * stays the key. Filled by {@link de.hbt.pwr.view.service.ViewProfileLocalizationService}.
     */
    private String localizedName;

    /** Without a localized name, as before #291 */
    public Language(String name, LanguageLevel level, Boolean enabled) {
        this.name = name;
        this.level = level;
        this.enabled = enabled;
    }
}
