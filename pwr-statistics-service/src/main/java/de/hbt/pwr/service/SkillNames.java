package de.hbt.pwr.service;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * The names of the skill tree (#208): a skill name in any case or an alias stands for the name of the skill in the
 * tree. Names the tree doesn't know stay as they are.
 */
public class SkillNames {

    private final Map<String, String> treeNames;

    SkillNames(Map<String, String> treeNames) {
        this.treeNames = treeNames;
    }

    public static SkillNames none() {
        return new SkillNames(new HashMap<>());
    }

    /**
     * From the answer of <code>GET /skill/tree</code>: categories with <code>childCategories</code> and
     * <code>childSkills</code>, skills with <code>qualifier</code> and <code>aliases</code>
     */
    public static SkillNames fromTree(JsonNode root) {
        Map<String, String> skillNames = new HashMap<>();
        Map<String, String> aliases = new HashMap<>();
        collect(root, skillNames, aliases);
        // A name of a skill wins over an alias of another one
        aliases.forEach(skillNames::putIfAbsent);
        return new SkillNames(skillNames);
    }

    private static void collect(JsonNode category, Map<String, String> skillNames, Map<String, String> aliases) {
        for (JsonNode skill : category.path("childSkills")) {
            String name = skill.path("qualifier").asText(null);
            if (name != null) {
                skillNames.put(key(name), name);
                skill.path("aliases").forEach(alias -> aliases.put(key(alias.asText()), name));
            }
        }
        for (JsonNode child : category.path("childCategories")) {
            collect(child, skillNames, aliases);
        }
    }

    public String treeName(String name) {
        if (name == null) {
            return null;
        }
        return treeNames.getOrDefault(key(name), name.trim());
    }

    public boolean isEmpty() {
        return treeNames.isEmpty();
    }

    private static String key(String name) {
        return name.trim().toLowerCase(Locale.ROOT);
    }
}
