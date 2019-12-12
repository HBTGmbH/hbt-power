package de.hbt.pwr.view.client.skill.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Data
public class SkillServiceCategory {
    private Integer id;
    private String qualifier;
    private List<LocalizedQualifier> qualifiers = new ArrayList<>();
    private SkillServiceCategory category;
    private Boolean custom;
    private Boolean blacklisted;
    private Boolean display = false;

    public SkillServiceCategory() {
        // Default empty constructor for jackson
    }

    public SkillServiceCategory(String qualifier) {
        this.qualifier = qualifier;
    }

    public SkillServiceCategory(Integer id, String qualifier) {
        this.id = id;
        this.qualifier = qualifier;
    }

    public SkillServiceCategory(String qualifier, SkillServiceCategory category) {
        this.qualifier = qualifier;
        this.category = category;
    }

    public SkillServiceCategory(String qualifier, SkillServiceCategory category, Boolean display) {
        this.qualifier = qualifier;
        this.category = category;
        this.display = display;
    }

    public String getLocalizedQualifier(String locale) {
        if (locale == null || this.qualifiers == null) {
            return qualifier;
        }
        Optional<String> name = qualifiers.stream()
                .filter(localizedQualifier -> locale.equals(localizedQualifier.getLocale()))
                .map(LocalizedQualifier::getQualifier).findAny();
        return name.orElse(qualifier);
    }
}
