package de.hbt.model.skill;

import java.util.HashSet;
import java.util.Set;

public class SkillCategory {

    private String qualifier;
    private Set<LocalizedQualifier> qualifiers = new HashSet<>();
    private SkillCategory category;

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

    public String getQualifierByLocale(String language) {
        return qualifiers.stream()
                .filter(lq -> language.equals(lq.getLocale()))
                .findFirst()
                .map(fq -> fq.getQualifier())
                .orElse(qualifier);
    }

}
