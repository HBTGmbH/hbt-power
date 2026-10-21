package de.hbt.pwr.profile.client;

import java.util.Locale;
import java.util.Set;

/**
 * Which skill names (and aliases) the skill tree knows, and which of them still lie in the category Other (#139)
 */
public class SkillTreeIndex {

    private final Set<String> known;
    private final Set<String> inOther;

    public SkillTreeIndex(Set<String> known, Set<String> inOther) {
        this.known = known;
        this.inOther = inOther;
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
