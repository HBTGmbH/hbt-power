package de.hbt.power.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A language with localizations (#174): its ISO 639-2 code and its German name
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LocalizationLanguage {
    private String code;
    private String name;
}
