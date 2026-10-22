package de.hbt.pwr.profile.client;

import org.junit.Before;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withNoContent;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

public class StatisticsClientTest {

    private MockRestServiceServer server;
    private StatisticsClient client;

    @Before
    public void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        server = MockRestServiceServer.createServer(restTemplate);
        client = new StatisticsClient(restTemplate);
        ReflectionTestUtils.setField(client, "pwrStatisticsServiceUrl", "http://statistics");
    }

    @Test
    public void refreshConsultants_asksTheStatisticsServiceToReload() {
        server.expect(requestTo("http://statistics/admin/consultants/refresh"))
                .andExpect(method(POST))
                .andRespond(withNoContent());

        client.refreshConsultants();

        server.verify();
    }

    /**
     * The merge stands without the statistics; their hourly refresh catches up (#205)
     */
    @Test
    public void refreshConsultants_toleratesAStatisticsServiceThatDoesNotAnswer() {
        server.expect(requestTo("http://statistics/admin/consultants/refresh"))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        client.refreshConsultants();

        server.verify();
    }
}
