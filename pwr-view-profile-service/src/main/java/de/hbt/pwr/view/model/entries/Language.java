package de.hbt.pwr.view.model.entries;

import de.hbt.pwr.view.model.LanguageLevel;
import lombok.Data;

@Data
public class Language implements ToggleableEntry {
    private String name;
    private LanguageLevel level;
    private Boolean enabled;
}
