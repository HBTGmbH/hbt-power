package de.hbt.pwr.service;

import de.hbt.pwr.StreamUtils;
import de.hbt.pwr.client.PowerProfileClient;
import de.hbt.pwr.model.StatisticsConfig;
import de.hbt.pwr.model.clustering.ClusteredNetwork;
import de.hbt.pwr.model.clustering.ProfileClusterable;
import de.hbt.pwr.model.clustering.ProfileMedoid;
import de.hbt.pwr.model.profile.Consultant;
import de.hbt.pwr.repo.ClusteredNetworkRepo;
import de.hbt.pwr.repo.ConsultantRepository;
import de.hbt.pwr.repo.StatisticsConfigRepo;
import de.hbt.pwr.statistics.KMedoidCommonSkillMetric;
import de.hbt.pwr.statistics.KMedoidMetric;
import de.hbt.pwr.statistics.KMedoidSimRankMetric;
import de.hbt.pwr.statistics.ProfileKMedoidClusterer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StopWatch;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AsyncInformationService {

    private final ConsultantRepository consultantRepository;
    private final PowerProfileClient powerProfileClient;
    private final ClusteredNetworkRepo clusteredNetworkRepo;
    private final StatisticsConfigRepo statisticsConfigRepo;


    private static final Logger LOG = LoggerFactory.getLogger(AsyncInformationService.class);


    @Autowired
    public AsyncInformationService(ConsultantRepository consultantRepository,
                                   PowerProfileClient powerProfileClient, ClusteredNetworkRepo clusteredNetworkRepo, StatisticsConfigRepo statisticsConfigRepo) {
        this.consultantRepository = consultantRepository;
        this.powerProfileClient = powerProfileClient;
        this.clusteredNetworkRepo = clusteredNetworkRepo;
        this.statisticsConfigRepo = statisticsConfigRepo;
    }


    private StatisticsConfig getConfig() {
        return StreamUtils.asStream(statisticsConfigRepo.findAll().iterator()).findFirst().get();
    }

    @Async
    void refreshConsultantData() {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        LOG.info("Starting async refresh task for consultant data.");
        // Retreive all consultant
        LOG.info("Requesting all consultants from profile service...");
        List<Consultant> consultantList = powerProfileClient.getAllConsultants();
        LOG.info("...done. Received " + consultantList.size() + " consultants.");
        LOG.info("Deleting all old consultants...");
        // Delete all old consultants
        consultantRepository.deleteAll(consultantRepository.findAll());
        LOG.info("...done.");
        LOG.info("Saving " + consultantList.size() + " consultants...");
        // Save all new.
        consultantRepository.saveAll(consultantList);
        LOG.info("..done.");
        stopWatch.stop();
        LOG.info("Async refresh task done. Took " + stopWatch.getTotalTimeSeconds() + " seconds.");
    }

    @Async
    void refreshStatistics() {
        final StatisticsConfig config = getConfig();
        List<Consultant> consultants = StreamUtils.asStream(consultantRepository.findAll().iterator()).collect(Collectors.toList());
        List<ProfileClusterable> values = consultants.stream().map(consultant -> new ProfileClusterable(consultant.getProfile())).collect(Collectors.toList());

        Map<Long, String> initialsByProfileId = new HashMap<>();
        consultants.forEach(consultant -> initialsByProfileId.put(consultant.getProfile().getId(), consultant.getInitials()));

        KMedoidMetric metric = null;
        // Create the metric
        switch (config.getCurrentMetricType()) {
            case SIM_RANK:
                metric = new KMedoidSimRankMetric(values.stream().map(ProfileClusterable::getProfile).collect(Collectors.toList()));
                break;
            case COMMON_SKILLS:
                metric = new KMedoidCommonSkillMetric();
                break;
            default:
                throw new IllegalArgumentException(config.getCurrentMetricType().toString());
        }

        ProfileKMedoidClusterer clusterer = new ProfileKMedoidClusterer(config.getCurrentKMedIterations(), metric);
        List<ProfileMedoid> medoids = clusterer.cluster(values, config.getCurrentKMedClusters());

        ClusteredNetwork result = new ClusteredNetwork(medoids, initialsByProfileId, values);


        // Get all old IDs
        List<String> old = StreamUtils.asStream(clusteredNetworkRepo.findAll().iterator()).map(ClusteredNetwork::getId).collect(Collectors.toList());
        // Add the new.
        clusteredNetworkRepo.save(result);
        // Delete all old
        old.forEach(clusteredNetworkRepo::deleteById);
    }

    private void initConfigIfUninitialized() {
        if(statisticsConfigRepo.count() <= 0) {
            LOG.info("No Configuration stored in database. Storing default config.");
            statisticsConfigRepo.save(new StatisticsConfig());
        }
    }


    /**
     * Invokes a refresh of the stored data
     */
    @Scheduled(fixedRate = 60000L * 60L)
    public void invokeConsultantDataRefresh() {
        initConfigIfUninitialized();
        refreshConsultantData();
        refreshStatistics();
    }

}
