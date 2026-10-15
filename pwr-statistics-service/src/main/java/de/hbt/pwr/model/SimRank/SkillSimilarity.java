package de.hbt.pwr.model.SimRank;

import lombok.Value;

@Value
public class SkillSimilarity {
    SkillNode node1;
    SkillNode node2;

    double simVal;

    public SkillSimilarity(SkillNode node1, SkillNode node2, double simVal) {
        this.node1 = node1;
        this.node2 = node2;
        this.simVal = simVal;
    }

    public boolean nodesAreEqual() {
        return node1.getSkillName().equals(node2.getSkillName());
    }

    public SkillSimilarity updateSimVal(double newVal) {
        return new SkillSimilarity(node1, node2, newVal);
    }
}
