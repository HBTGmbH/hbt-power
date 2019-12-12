package de.hbt.pwr.view.client.skill.model;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Data
public class SkillServiceSkill {
    private Integer id;
    private String qualifier;
    private SkillServiceCategory category;
    private List<LocalizedQualifier> qualifiers = new ArrayList<>();
    private Boolean custom;
    private List<String> versions;

    public SkillServiceSkill() {
        /* Default Empty Constrcutor for jackson*/
    }

    public SkillServiceSkill(String qualifier) {
        this.qualifier = qualifier;
    }

    public SkillServiceSkill(String qualifier, SkillServiceCategory category) {
        this.qualifier = qualifier;
        this.category = category;
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
