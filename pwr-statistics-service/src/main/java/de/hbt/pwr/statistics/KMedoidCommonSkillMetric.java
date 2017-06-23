package de.hbt.pwr.statistics;

import de.hbt.pwr.model.clustering.ProfileClusterable;
import de.hbt.pwr.model.clustering.ProfileMedoid;
import de.hbt.pwr.model.clustering.SkillWrapper;

import java.util.HashSet;

/**
 * Created by nt on 22.06.2017.
 */
public class KMedoidCommonSkillMetric implements KMedoidMetric {
    @Override
    public double measure(ProfileClusterable clusterable, ProfileMedoid medoid) {
        HashSet<SkillWrapper> intersection = new HashSet<>(medoid.getMedoid().getValues());
        intersection.retainAll(clusterable.getValues());
        return intersection.size();
    }
}
