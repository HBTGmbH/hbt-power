package de.hbt.pwr.view.model.entries;

import de.hbt.pwr.view.model.LanguageLevel;
import de.hbt.pwr.view.model.entries.sort.NameComparable;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@AllArgsConstructor
public class Language implements ToggleableEntry, NameComparable {
    private String name;
    private LanguageLevel level;
    private Boolean enabled;
}
