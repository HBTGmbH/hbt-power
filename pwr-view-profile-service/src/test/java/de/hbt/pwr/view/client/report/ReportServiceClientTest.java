package de.hbt.pwr.view.client.report;

import de.hbt.pwr.view.client.report.model.ReportInfo;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.HttpMethod;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.headerDoesNotExist;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

/**
 * The export passes on who is logged in as headers, so the report service knows who exported (#214)
 */
public class ReportServiceClientTest {

    private ReportServiceClient client;
    private MockRestServiceServer server;

    @Before
    public void setUp() {
        client = new ReportServiceClient();
        ReflectionTestUtils.setField(client, "pwrReportServiceUrl", "http://report");
        server = MockRestServiceServer.bindTo((RestTemplate) ReflectionTestUtils.getField(client, "restTemplate")).build();
    }

    @Test
    public void sendsTheHeadersOfTheLoggedInUser() {
        server.expect(requestTo("http://report/report?type=DOC"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header(ReportServiceClient.USER_LOGIN_HEADER, "ada.admin@example.com"))
                .andExpect(header(ReportServiceClient.USER_INITIALS_HEADER, "adm"))
                .andRespond(withSuccess());

        client.generateReport(new ReportInfo(), "DOC", "ada.admin@example.com", "adm");

        server.verify();
    }

    @Test
    public void sendsNoHeadersWithoutAUser() {
        server.expect(requestTo("http://report/report?type=DOC"))
                .andExpect(headerDoesNotExist(ReportServiceClient.USER_LOGIN_HEADER))
                .andExpect(headerDoesNotExist(ReportServiceClient.USER_INITIALS_HEADER))
                .andRespond(withSuccess());

        client.generateReport(new ReportInfo(), "DOC", null, null);

        server.verify();
    }
}
