package de.hbt.pwr.model;

import de.hbt.pwr.model.profile.Skill;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;

@Data
public class SkillAverageRating {
    // These values are output.
    private String name;
    private Integer occurrences = 0;
    private Double meanRating = 0.0;

    // these values are for calculations
    @Setter(value = AccessLevel.NONE)
    @Getter(value = AccessLevel.NONE)
    private DescriptiveStatistics descriptiveStatistics = new DescriptiveStatistics();

    public SkillAverageRating(String name) {
        this.name = name;
    }

    public void addSkill(Skill s) {
        if(!s.getName().equals(name)) throw new IllegalArgumentException("Skillname must equal name");
        descriptiveStatistics.addValue(s.getRating());
    }

    public void evaluate() {
        occurrences = descriptiveStatistics.getValues().length;
        meanRating = descriptiveStatistics.getMean();
    }

}
