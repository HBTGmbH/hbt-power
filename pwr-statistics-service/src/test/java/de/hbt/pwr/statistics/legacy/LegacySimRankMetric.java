package de.hbt.pwr.statistics.legacy;

import de.hbt.pwr.model.clustering.ProfileClusterable;
import de.hbt.pwr.model.clustering.ProfileMedoid;
import de.hbt.pwr.model.profile.Profile;
import de.hbt.pwr.statistics.KMedoidMetric;

import java.util.List;

/**
 * KMedoidSimRankMetric as before #292, on {@link LegacySimRank}
 */
public class LegacySimRankMetric implements KMedoidMetric {

    private final ProfileSkillNetwork network;

    public LegacySimRankMetric(List<Profile> profiles) {
        network = new LegacySimRank().rank(profiles);
    }

    @Override
    public double measure(ProfileClusterable clusterable, ProfileMedoid medoid) {
        return network.getProfileSimilarity(clusterable.getProfile().getId(), medoid.getMedoid().getProfile().getId()).getSimVal();
    }
}
