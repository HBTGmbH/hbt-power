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

    public ResponseEntity<String> generateReport(ReportInfo reportInfo, String type, Integer charsPerLine) {
        return restTemplate.exchange(pwrReportServiceUrl + "/report?type={type}&charsperline={charsPerLine}",
                HttpMethod.POST,
                new HttpEntity<>(reportInfo),
                String.class,
                Map.of("type", type, "charsPerLine", charsPerLine)
        );
    }
}
