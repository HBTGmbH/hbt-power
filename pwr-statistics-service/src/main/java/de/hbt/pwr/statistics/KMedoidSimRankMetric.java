package de.hbt.pwr.statistics;

import de.hbt.pwr.model.clustering.ProfileClusterable;
import de.hbt.pwr.model.clustering.ProfileMedoid;
import de.hbt.pwr.model.profile.Profile;

import java.util.List;

/**
 * Created by nt on 22.06.2017.
 */
public class KMedoidSimRankMetric implements KMedoidMetric {

    private final SimRank.Similarities similarities;

    public KMedoidSimRankMetric(List<Profile> profiles) {
        similarities = new SimRank().rank(profiles);
    }

    @Override
    public double measure(ProfileClusterable clusterable, ProfileMedoid medoid) {
        return similarities.profileSimilarity(clusterable.getProfile().getId(), medoid.getMedoid().getProfile().getId());
    }
}
