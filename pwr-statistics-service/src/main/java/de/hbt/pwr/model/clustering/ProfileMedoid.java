package de.hbt.pwr.model.clustering;

import java.util.ArrayList;
import java.util.List;

/**
 *
 */
public class ProfileMedoid {

    private Long clusterId = 0L;

    /**
     * The medoid
     */
    private ProfileClusterable medoid;
    /**
     * Values assigned to the medoids clusters
     */
    private List<ProfileClusterable> values = new ArrayList<>();

    /**
     * The current cost of this medoid.
     */
    private Double cost = 0.0;


    public ProfileMedoid(ProfileClusterable medoid) {
        this.medoid = medoid;
    }

    public void addValue(ProfileClusterable clusterable, Double distance) {
        values.add(clusterable);
        cost += distance;
    }

    public Double getCost() {
        return cost;
    }

    public ProfileMedoid resetCopy() {
        return new ProfileMedoid(medoid);
    }

    public ProfileClusterable getMedoid() {
        return medoid;
    }

    public void setMedoid(ProfileClusterable medoid) {
        this.medoid = medoid;
    }

    public List<ProfileClusterable> getValues() {
        return values;
    }

    public void setValues(List<ProfileClusterable> values) {
        this.values = values;
    }

    public Long getClusterId() {
        return clusterId;
    }

    public void setClusterId(Long clusterId) {
        this.clusterId = clusterId;
    }

}
