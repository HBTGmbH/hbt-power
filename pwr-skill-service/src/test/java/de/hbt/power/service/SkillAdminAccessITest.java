package de.hbt.power.service;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Only admins reach <code>/admin</code>, also if the edge is passed by another way of writing the path (#260).
 * Through a real Tomcat, which normalizes the path before Spring MVC sees it.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles("test")
public class SkillAdminAccessITest {

    /**
     * No skill has this id: an allowed request fails behind the check, a rejected one never gets there
     */
    private static final String DELETE_UNKNOWN_SKILL = "/admin/skill/987654321";

    @LocalServerPort
    private int port;

    private final HttpClient client = HttpClient.newHttpClient();

    private int delete(String rawPath, String admin) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + rawPath)).DELETE();
        if (admin != null) {
            request.header("X-Pwr-User-Admin", admin);
        }
        return client.send(request.build(), HttpResponse.BodyHandlers.discarding()).statusCode();
    }

    @Test
    public void userReachesNoAdminEndpoint() throws Exception {
        assertThat(delete(DELETE_UNKNOWN_SKILL, "false")).isEqualTo(403);
    }

    @Test
    public void userReachesNoAdminEndpointByAnotherWayOfWritingThePath() throws Exception {
        assertThat(delete("/skill/.." + DELETE_UNKNOWN_SKILL, "false")).isEqualTo(403);
        assertThat(delete("/skill/%2e%2e" + DELETE_UNKNOWN_SKILL, "false")).isEqualTo(403);
        assertThat(delete("/admin;x/skill/987654321", "false")).isEqualTo(403);
        assertThat(delete("/%61dmin/skill/987654321", "false")).isEqualTo(403);
        assertThat(delete("/admin/skill/987654321/", "false")).isEqualTo(403);
    }

    @Test
    public void adminAndCallsWithoutTheEdgeReachTheAdminEndpoints() throws Exception {
        assertThat(delete(DELETE_UNKNOWN_SKILL, "true")).isNotEqualTo(403);
        assertThat(delete(DELETE_UNKNOWN_SKILL, null)).isNotEqualTo(403);
    }
}
