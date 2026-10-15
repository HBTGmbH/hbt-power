package de.hbt.pwr.profile.model.skill;

import java.util.HashSet;
import java.util.Set;

public class SkillCategory {

    private String qualifier = "";
    private Set<LocalizedQualifier> qualifiers = new HashSet<>();
    private SkillCategory category;
    private boolean blacklisted = false;

    public String getQualifier() {
        return qualifier;
    }

    public void setQualifier(String qualifier) {
        this.qualifier = qualifier;
    }

    public Set<LocalizedQualifier> getQualifiers() {
        return qualifiers;
    }

    public void setQualifiers(Set<LocalizedQualifier> qualifiers) {
        this.qualifiers = qualifiers;
    }

    public SkillCategory getCategory() {
        return category;
    }

    public void setCategory(SkillCategory category) {
        this.category = category;
    }

    public boolean isBlacklisted() {
        return blacklisted;
    }

    public void setBlacklisted(boolean blacklisted) {
        this.blacklisted = blacklisted;
    }

}
