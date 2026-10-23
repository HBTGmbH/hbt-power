package de.hbt.pwr.profile.client;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Which skill names (and aliases) the skill tree knows, and which of them still lie in the category Other (#139).
 * Also the name in the tree that a name or alias stands for (#208).
 */
public class SkillTreeIndex {

    private final Set<String> known;
    private final Set<String> inOther;
    private final Map<String, String> treeNames;

    public SkillTreeIndex(Set<String> known, Set<String> inOther) {
        this(known, inOther, new HashMap<>());
    }

    public SkillTreeIndex(Set<String> known, Set<String> inOther, Map<String, String> treeNames) {
        this.known = known;
        this.inOther = inOther;
        this.treeNames = treeNames;
    }

    /**
     * The name of the skill in the tree for a skill name in any case or an alias; a name the tree doesn't know stays
     */
    public String treeName(String skillName) {
        return treeNames.getOrDefault(normalize(skillName), skillName == null ? null : skillName.trim());
    }

    /**
     * Not sorted into the skill tree yet: in Other, or not in the tree at all
     */
    public boolean isUnsorted(String skillName) {
        String name = normalize(skillName);
        return inOther.contains(name) || !known.contains(name);
    }

    static String normalize(String name) {
        return name == null ? "" : name.trim().toLowerCase(Locale.ROOT);
    }
}
