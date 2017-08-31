package de.hbt.pwr.view.client.skill.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class SkillServiceSkill {
    private Integer id;
    private String qualifier;
    private SkillServiceCategory category;
    private List<LocalizedQualifier> qualifiers = new ArrayList<>();
    private Boolean custom;

    public SkillServiceSkill() {
    }

    public SkillServiceSkill(String qualifier) {
        this.qualifier = qualifier;
    }

    public SkillServiceSkill(String qualifier, SkillServiceCategory category) {
        this.qualifier = qualifier;
        this.category = category;
    }
}
