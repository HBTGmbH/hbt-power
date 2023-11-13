package de.hbt.pwr.model;

import de.hbt.pwr.model.clustering.MetricType;
import lombok.Data;
@Data
public class StatisticsConfig {

    public static final Integer DEFAULT_MAX_SKILLS = 10;
    public static final Integer DEFAULT_ITERATIONS = 50;
    public static final Integer DEFAULT_CLUSTERS = 2;
    public static final MetricType DEFAULT_METRIC_TYPE = MetricType.SIM_RANK;

    private Integer currentKMedIterations = DEFAULT_ITERATIONS;
    private Integer currentKMedClusters = DEFAULT_CLUSTERS;
    private MetricType currentMetricType = DEFAULT_METRIC_TYPE;
}
