package de.hbt.pwr.model;

import lombok.Data;

@Data
public class SkillUsage {
    private String name;
    private Long value;

    public SkillUsage() {

    }

    public SkillUsage(String name, Long quantity) {
        this.name = name;
        this.value = quantity;
    }

    public boolean hasHigherUsage(float threshold, long refVal) {
        return (float) value / (float)refVal >= threshold;
    }

}
