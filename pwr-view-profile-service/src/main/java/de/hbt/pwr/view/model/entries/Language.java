package de.hbt.pwr.view.model.entries;

import de.hbt.pwr.view.model.LanguageLevel;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@AllArgsConstructor
public class Language implements ToggleableEntry {
    private String name;
    private LanguageLevel level;
    private Boolean enabled;
}
