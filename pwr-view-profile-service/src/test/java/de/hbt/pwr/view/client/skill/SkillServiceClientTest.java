package de.hbt.pwr.view.client.skill;

import org.junit.Before;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

public class SkillServiceClientTest {

    private MockRestServiceServer server;
    private SkillServiceClient client;

    @Before
    public void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        server = MockRestServiceServer.createServer(restTemplate);
        client = new SkillServiceClient(restTemplate);
        ReflectionTestUtils.setField(client, "pwrSkillServiceUrl", "http://skill");
    }

    /** A '+' left as it is arrives as a space, and the skill isn't found (#330) */
    @Test
    public void getSkillByName_encodesTheNameCompletely() {
        server.expect(requestTo("http://skill/skill/byName?qualifier=Visual%20C%2B%2B"))
                .andExpect(method(GET))
                .andRespond(withSuccess("{\"id\": 9, \"qualifier\": \"Visual C++\"}", MediaType.APPLICATION_JSON));

        assertThat(client.getSkillByName("Visual C++").getQualifier()).isEqualTo("Visual C++");
        server.verify();
    }

    @Test
    public void getSkillByName_encodesOtherCharactersToo() {
        server.expect(requestTo("http://skill/skill/byName?qualifier=Veeam%20Backup%20%26%20Replication%20%23%3D"))
                .andRespond(withSuccess("{\"id\": 3, \"qualifier\": \"Veeam Backup & Replication #=\"}", MediaType.APPLICATION_JSON));

        assertThat(client.getSkillByName("Veeam Backup & Replication #=").getId()).isEqualTo(3);
    }

    @Test
    public void getSkillByName_isNullForASkillTheTreeDoesNotKnow() {
        server.expect(requestTo("http://skill/skill/byName?qualifier=Unbekannt"))
                .andRespond(withStatus(HttpStatus.NO_CONTENT));

        assertThat(client.getSkillByName("Unbekannt")).isNull();
    }
}
