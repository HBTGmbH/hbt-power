package de.hbt.pwr.view.client.report;

import de.hbt.pwr.view.client.report.model.ReportInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import de.hbt.pwr.view.client.RestClientConfig;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ReportServiceClient {

    static final String USER_LOGIN_HEADER = "X-Pwr-User-Login";
    static final String USER_INITIALS_HEADER = "X-Pwr-User-Initials";

    @Value("${pwr-report-service-url}")
    private String pwrReportServiceUrl;

    private final RestTemplate restTemplate;

    /**
     * For the preview, which the report service renders for up to 10 s (#155, #249)
     */
    private final RestTemplate slowRestTemplate;

    public ReportServiceClient(RestTemplate restTemplate, @Qualifier(RestClientConfig.SLOW) RestTemplate slowRestTemplate) {
        this.restTemplate = restTemplate;
        this.slowRestTemplate = slowRestTemplate;
    }

    /**
     * Renders the report as PDF, only in memory: no entry in the report history.
     *
     * @throws org.springframework.web.client.HttpClientErrorException.UnprocessableEntity if the template cannot be
     *                                                                                    rendered with this data
     */
    public byte[] renderPdfPreview(ReportInfo reportInfo) {
        return slowRestTemplate.postForObject(pwrReportServiceUrl + "/report/preview", reportInfo, byte[].class);
    }

    /**
     * Starts the export into the report history. Who is logged in goes on in the headers the edge set (#214), so the
     * report service knows who exported; without them (locally without the edge) nobody is passed on.
     */
    public ResponseEntity<String> generateReport(ReportInfo reportInfo, String type, String userLogin, String userInitials) {
        HttpHeaders headers = new HttpHeaders();
        if (userLogin != null) {
            headers.set(USER_LOGIN_HEADER, userLogin);
        }
        if (userInitials != null) {
            headers.set(USER_INITIALS_HEADER, userInitials);
        }
        return restTemplate.exchange(pwrReportServiceUrl + "/report?type={type}",
                HttpMethod.POST,
                new HttpEntity<>(reportInfo, headers),
                String.class,
                Map.of("type", type)
        );
    }
}
