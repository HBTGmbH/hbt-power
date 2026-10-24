package de.hbt.pwr.view.client.profile.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The name of a profile element in a language (#291), from {@code GET /admin/name-entities/localizations}
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class NameEntityLocalization {
    private NameEntityType type;
    private String name;
    private String language;
    private String qualifier;
}
