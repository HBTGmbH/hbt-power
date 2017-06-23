package de.hbt.pwr.model;

import lombok.Data;

@Data
public class RelativeSkillUsage {
    public String name;
    public Float value;

    public RelativeSkillUsage(String name, Float usage) {
        this.name = name;
        this.value = usage;
    }

    public RelativeSkillUsage(SkillUsage skillUsage, long max) {
        this.name = skillUsage.getName();
        this.value = (float) skillUsage.getValue() / (float) max;
    }

    public RelativeSkillUsage() {
    }

}