package de.hbt.pwr.view.client.report;

import de.hbt.pwr.view.client.report.model.ReportInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ReportServiceClient {

    @Value("${pwr-report-service-url}")
    private String pwrReportServiceUrl;

    private final RestTemplate restTemplate;

    public ReportServiceClient() {
        restTemplate = new RestTemplate();
    }

    /**
     * Renders the report as PDF, only in memory: no entry in the report history.
     *
     * @throws org.springframework.web.client.HttpClientErrorException.UnprocessableEntity if the template cannot be
     *                                                                                    rendered with this data
     */
    public byte[] renderPdfPreview(ReportInfo reportInfo) {
        return restTemplate.postForObject(pwrReportServiceUrl + "/report/preview", reportInfo, byte[].class);
    }

    public ResponseEntity<String> generateReport(ReportInfo reportInfo, String type) {
        return restTemplate.exchange(pwrReportServiceUrl + "/report?type={type}",
                HttpMethod.POST,
                new HttpEntity<>(reportInfo),
                String.class,
                Map.of("type", type)
        );
    }
}
