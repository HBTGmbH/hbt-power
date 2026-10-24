package de.hbt.pwr.profile.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * The exported documents in the report service (#240)
 */
@Service
public class ReportClient {

    @Value("${pwr-report-service-url}")
    private String pwrReportServiceUrl;
    private final RestTemplate restTemplate;

    public ReportClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Deletes every document about the consultant with these initials; none is no error
     */
    public void deleteAllReports(String initials) {
        restTemplate.delete(pwrReportServiceUrl + "/admin/report/{initials}", initials);
    }
}
