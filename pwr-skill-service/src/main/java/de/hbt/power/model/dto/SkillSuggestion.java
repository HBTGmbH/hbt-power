package de.hbt.power.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A suggestion of the skill search: the name of the skill and, if the search term matched one of its aliases better
 * than the name, that alias ("Kubernetes" for "K8S").
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SkillSuggestion {
    private String name;
    private String matchingAlias;
}
