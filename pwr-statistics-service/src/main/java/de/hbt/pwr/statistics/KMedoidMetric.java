package de.hbt.pwr.statistics;

import de.hbt.pwr.model.clustering.ProfileClusterable;
import de.hbt.pwr.model.clustering.ProfileMedoid;

public interface KMedoidMetric {
    double measure(ProfileClusterable clusterable, ProfileMedoid medoid);
}
