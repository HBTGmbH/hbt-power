package de.hbt.pwr.statistics;

import de.hbt.pwr.model.SimRank.ProfileSkillNetwork;
import de.hbt.pwr.model.clustering.ProfileClusterable;
import de.hbt.pwr.model.clustering.ProfileMedoid;
import de.hbt.pwr.model.profile.Profile;

import java.util.List;

/**
 * Created by nt on 22.06.2017.
 */
public class KMedoidSimRankMetric implements KMedoidMetric {

    private final ProfileSkillNetwork network;

    public KMedoidSimRankMetric(List<Profile> profiles) {
        SimRank simRank = new SimRank();
        network = simRank.rank(profiles);
    }

    @Override
    public double measure(ProfileClusterable clusterable, ProfileMedoid medoid) {
        return network.getProfileSimilarity(clusterable.getProfile().getId(), medoid.getMedoid().getProfile().getId()).getSimVal();
    }
}
