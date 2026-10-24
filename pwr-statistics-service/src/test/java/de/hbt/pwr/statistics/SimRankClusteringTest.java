package de.hbt.pwr.statistics;

import de.hbt.pwr.model.clustering.ProfileClusterable;
import de.hbt.pwr.model.clustering.ProfileMedoid;
import de.hbt.pwr.model.profile.Profile;
import de.hbt.pwr.statistics.legacy.LegacySimRankMetric;
import org.junit.jupiter.api.Test;

import java.util.*;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The clusters stay the same with the new SimRank (#292): clustered with the same random, the metric before and the
 * new one give the same medoids with the same consultants
 */
public class SimRankClusteringTest {

    @Test
    public void theClusters_areTheSameAsWithTheImplementationBefore() {
        // Fewer skills than in production, so the implementation before is quick
        List<Profile> profiles = SimRankTest.randomProfiles(1292, 40, 150, 5, 25);
        List<ProfileClusterable> values = profiles.stream().map(ProfileClusterable::new).collect(Collectors.toList());
        KMedoidMetric before = new LegacySimRankMetric(profiles);
        KMedoidMetric now = new KMedoidSimRankMetric(profiles);

        for (long seed = 0; seed < 5; seed++) {
            for (int clusters = 2; clusters <= 4; clusters++) {
                assertThat(clustersOf(new ProfileKMedoidClusterer(50, now, new Random(seed)).cluster(values, clusters)))
                        .as("seed %d, %d clusters", seed, clusters)
                        .isEqualTo(clustersOf(new ProfileKMedoidClusterer(50, before, new Random(seed)).cluster(values, clusters)));
            }
        }
    }

    @Test
    public void asManyClustersAsProfiles_giveNoClusters() {
        List<Profile> profiles = SimRankTest.randomProfiles(2, 2, 10, 1, 5);
        List<ProfileClusterable> values = profiles.stream().map(ProfileClusterable::new).collect(Collectors.toList());

        assertThat(new ProfileKMedoidClusterer(50, new KMedoidSimRankMetric(profiles)).cluster(values, 2)).isEmpty();
    }

    /**
     * The medoid and the other profiles of each cluster, by id
     */
    private static Map<Long, Set<Long>> clustersOf(List<ProfileMedoid> medoids) {
        assertThat(medoids).isNotEmpty();
        Map<Long, Set<Long>> clusters = new HashMap<>();
        medoids.forEach(medoid -> clusters.put(medoid.getMedoid().getProfile().getId(), medoid.getValues().stream()
                .map(value -> value.getProfile().getId()).collect(Collectors.toSet())));
        return clusters;
    }
}
