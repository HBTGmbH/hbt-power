package de.hbt.pwr.model.SimRank;

import lombok.Value;
import org.jetbrains.annotations.NotNull;

@Value
public class SkillSimilarity {
    private SkillNode node1;
    private SkillNode node2;

    private double simVal;

    public SkillSimilarity(SkillNode node1, SkillNode node2, double simVal) {
        this.node1 = node1;
        this.node2 = node2;
        this.simVal = simVal;
    }

    public boolean nodesAreEqual() {
        return node1.getSkillName().equals(node2.getSkillName());
    }

    @NotNull
    public SkillSimilarity updateSimVal(double newVal) {
        return new SkillSimilarity(node1, node2, newVal);
    }
}
