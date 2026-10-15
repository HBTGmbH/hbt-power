package de.hbt.pwr.model.SimRank;

import lombok.Value;

@Value
public class ProfileSimilarity {
    ProfileNode node1;
    ProfileNode node2;

    double simVal;

    public ProfileSimilarity(ProfileNode node1, ProfileNode node2, double simVal) {
        this.node1 = node1;
        this.node2 = node2;
        this.simVal = simVal;
    }

    public boolean nodesAreEqual() {
        return node1.getProfileId().equals(node2.getProfileId());
    }

    public ProfileSimilarity updateSimVal(double newVal){
        return new ProfileSimilarity(node1, node2, newVal);
    }
}
