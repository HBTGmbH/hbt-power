package de.hbt.pwr.view.service;

import de.hbt.pwr.view.client.profile.model.FormerName;
import de.hbt.pwr.view.client.profile.model.NameEntityType;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * The current names of renamed and merged profile elements (#230): updating a view profile finds an entry it showed
 * under a former name. Names compare ignoring case (#207).
 */
class FormerNames {

    private final Map<NameEntityType, Map<String, String>> currentNames = new HashMap<>();

    FormerNames(List<FormerName> formerNames) {
        formerNames.stream()
                .filter(formerName -> formerName.getType() != null && formerName.getName() != null && formerName.getCurrentName() != null)
                .forEach(formerName -> currentNames.computeIfAbsent(formerName.getType(), type -> new HashMap<>())
                        .put(key(formerName.getName()), formerName.getCurrentName()));
    }

    /**
     * The current name of the element that had <code>name</code>, else <code>name</code>
     */
    String currentName(NameEntityType type, String name) {
        if (name == null) {
            return null;
        }
        return currentNames.getOrDefault(type, Map.of()).getOrDefault(key(name), name);
    }

    /**
     * Whether <code>oldName</code> of an old view profile is <code>newName</code> now
     */
    boolean isNow(NameEntityType type, String oldName, String newName) {
        String current = currentName(type, oldName);
        return current != null && newName != null && current.trim().equalsIgnoreCase(newName.trim());
    }

    private static String key(String name) {
        return name.trim().toLowerCase();
    }
}
