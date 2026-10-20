package de.hbt.pwr.profile.client;

import de.hbt.pwr.profile.errors.WebApplicationException;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

public class SkillProfileClientTest {

    private MockRestServiceServer server;
    private SkillProfileClient client;

    @Before
    public void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        server = MockRestServiceServer.createServer(restTemplate);
        client = new SkillProfileClient(restTemplate);
        ReflectionTestUtils.setField(client, "pwrSkillServiceUrl", "http://skill");
    }

    @Test
    public void mergeSkills_encodesTheNames() {
        server.expect(requestTo("http://skill/admin/skill/merge?source=C%2B%2B%2011&target=C%2B%2B"))
                .andExpect(method(POST))
                .andRespond(withSuccess());

        client.mergeSkills("C++ 11", "C++");

        server.verify();
    }

    @Test
    public void mergeSkills_keepsStatusAndMessageOfTheSkillService() {
        server.expect(requestTo("http://skill/admin/skill/merge?source=OpenShift&target=Kubernetes"))
                .andRespond(withStatus(HttpStatus.CONFLICT).contentType(MediaType.APPLICATION_JSON)
                        .body("{\"id\":7,\"errorType\":\"ERR_ALIAS_CONFLICT\",\"message\":\"'OpenShift' is already an alias\"}"));

        assertThatThrownBy(() -> client.mergeSkills("OpenShift", "Kubernetes"))
                .isInstanceOf(WebApplicationException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT)
                .hasMessage("'OpenShift' is already an alias");
    }
}
