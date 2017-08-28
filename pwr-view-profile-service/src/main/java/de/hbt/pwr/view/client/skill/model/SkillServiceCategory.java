package de.hbt.pwr.view.client.skill.model;

import lombok.Data;
import org.apache.tomcat.jni.Local;

import java.util.ArrayList;
import java.util.List;

@Data
public class SkillServiceCategory {
    private Integer id;
    private String qualifier;
    private List<LocalizedQualifier> qualifiers = new ArrayList<>();
    private SkillServiceCategory category;
    private Boolean custom;
    private Boolean blacklisted;

    public SkillServiceCategory() {
    }

    public SkillServiceCategory(String qualifier) {
        this.qualifier = qualifier;
    }
}
