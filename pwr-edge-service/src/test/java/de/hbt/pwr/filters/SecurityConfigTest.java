package de.hbt.pwr.filters;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockJwt;

/**
 * Checks the path rules of {@link SecurityConfig}. Authorized requests are routed to a port nobody listens on, so
 * they fail behind the security filter, which is enough to tell them apart from 401/403.
 */
@SpringBootTest(properties = "pwr.url.profile=http://localhost:1")
@AutoConfigureWebTestClient
class SecurityConfigTest {

    private static final String PROFILE_PICTURE = "/pwr-profile-service/profile-pictures/some-id";
    private static final String PROFILE_PICTURE_BY_INITIALS = "/pwr-profile-service/profile-pictures/by-initials/abc";

    @Autowired
    private WebTestClient webTestClient;

    // No issuer is configured in tests; mockJwt() bypasses the decoder
    @MockBean
    private ReactiveJwtDecoder jwtDecoder;

    @Test
    void profilePictureWithoutTokenIsUnauthorized() {
        webTestClient.get().uri(PROFILE_PICTURE).exchange().expectStatus().isUnauthorized();
    }

    @Test
    void profilePictureByInitialsWithoutTokenIsUnauthorized() {
        webTestClient.get().uri(PROFILE_PICTURE_BY_INITIALS).exchange().expectStatus().isUnauthorized();
    }

    @Test
    void profilePictureWithoutRoleIsForbidden() {
        webTestClient.mutateWith(mockJwt())
                .get().uri(PROFILE_PICTURE).exchange().expectStatus().isForbidden();
    }

    @Test
    void profilePictureAsUserPassesSecurity() {
        assertPassesSecurity("Power.User", PROFILE_PICTURE);
    }

    @Test
    void profilePictureAsAdminPassesSecurity() {
        assertPassesSecurity("Power.Admin", PROFILE_PICTURE);
    }

    @Test
    void adminPathAsUserIsForbidden() {
        webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority("Power.User")))
                .get().uri("/pwr-profile-service/admin/notifications").exchange().expectStatus().isForbidden();
    }

    @Test
    void appInfoOfTheEdgeNeedsAToken() {
        webTestClient.get().uri("/pwr-edge-service/actuator/info").exchange().expectStatus().isUnauthorized();
    }

    @Test
    void appInfoOfTheEdgeShowsVersionAndCommitButNoCommitter() {
        webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority("Power.User")))
                .get().uri("/pwr-edge-service/actuator/info").exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.build.version").exists()
                .jsonPath("$.git.commit.id").exists()
                .jsonPath("$.git.commit.time").exists()
                .jsonPath("$.git.commit.user").doesNotExist();
    }

    @Test
    void onlyHealthAndInfoArePublished() {
        webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority("Power.Admin")))
                .get().uri("/pwr-edge-service/actuator/env").exchange()
                .expectStatus().isNotFound();
    }

    private void assertPassesSecurity(String role, String path) {
        var status = webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority(role)))
                .get().uri(path).exchange()
                .returnResult(Void.class).getStatus();
        assertThat(status.value()).isNotIn(401, 403);
    }
}
