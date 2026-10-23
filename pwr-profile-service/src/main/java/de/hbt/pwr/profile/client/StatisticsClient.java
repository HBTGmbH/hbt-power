package de.hbt.pwr.profile.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class StatisticsClient {

    @Value("${pwr-statistics-service-url}")
    private String pwrStatisticsServiceUrl;
    private final RestTemplate restTemplate;

    public StatisticsClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Lets the statistics service reload the consultants right away instead of with its hourly refresh (#205), so the
     * admin sees who uses a skill after a merge. Returns when done. If the statistics service doesn't answer, the hourly
     * refresh catches up; the change of the profiles stands either way.
     */
    public void refreshConsultants() {
        try {
            restTemplate.postForEntity(pwrStatisticsServiceUrl + "/admin/consultants/refresh", null, Void.class);
        } catch (RuntimeException e) {
            log.warn("Statistics not refreshed, they catch up within the hour: " + e.getMessage());
        }
    }

    /**
     * The statistics read the profiles from this service, so a change of many profiles at once (#205, #227) lets them
     * reload only once it is committed; outside a transaction right away.
     */
    public void refreshConsultantsAfterCommit() {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            refreshConsultants();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
            @Override
            public void afterCommit() {
                refreshConsultants();
            }
        });
    }
}
