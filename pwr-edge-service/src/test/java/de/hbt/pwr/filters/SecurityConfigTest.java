package de.hbt.pwr.filters;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockJwt;

/**
 * Checks the path rules of {@link SecurityConfig}. Authorized requests are routed to a port nobody listens on, so
 * they fail behind the security filter, which is enough to tell them apart from 401/403.
 */
@SpringBootTest(properties = {"pwr.url.profile=http://localhost:1", "pwr.url.skill=http://localhost:1",
        "pwr.url.view-profile=http://localhost:1", "pwr.url.report=http://localhost:1"})
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

    /**
     * Every change to the skill tree (#178)
     */
    static Stream<Arguments> skillTreeChanges() {
        return Stream.of(
                Arguments.of(HttpMethod.POST, "/pwr-skill-service/admin/category/1"),
                Arguments.of(HttpMethod.DELETE, "/pwr-skill-service/admin/category/1"),
                Arguments.of(HttpMethod.PATCH, "/pwr-skill-service/admin/category/1/category/2"),
                Arguments.of(HttpMethod.PATCH, "/pwr-skill-service/admin/category/1/display/true"),
                Arguments.of(HttpMethod.POST, "/pwr-skill-service/admin/category/1/locale?lang=deu&qualifier=x"),
                Arguments.of(HttpMethod.DELETE, "/pwr-skill-service/admin/category/1/locale/deu"),
                Arguments.of(HttpMethod.POST, "/pwr-skill-service/admin/skill/category/1"),
                Arguments.of(HttpMethod.PATCH, "/pwr-skill-service/admin/skill/1/category/2"),
                Arguments.of(HttpMethod.DELETE, "/pwr-skill-service/admin/skill/1"),
                Arguments.of(HttpMethod.POST, "/pwr-skill-service/admin/skill/1/locale/deu?qualifier=x"),
                Arguments.of(HttpMethod.DELETE, "/pwr-skill-service/admin/skill/1/locale/deu"),
                Arguments.of(HttpMethod.DELETE, "/pwr-skill-service/admin/skill/1/version"),
                Arguments.of(HttpMethod.POST, "/pwr-skill-service/admin/skill/lucene/index"),
                Arguments.of(HttpMethod.POST, "/pwr-skill-service/admin/skill/1/alias?alias=x"),
                Arguments.of(HttpMethod.POST, "/pwr-skill-service/admin/skill/merge?source=a&target=b"));
    }

    @ParameterizedTest
    @MethodSource("skillTreeChanges")
    void skillTreeChangeAsUserIsForbidden(HttpMethod method, String path) {
        webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority("Power.User")))
                .method(method).uri(path).exchange().expectStatus().isForbidden();
    }

    @ParameterizedTest
    @MethodSource("skillTreeChanges")
    void skillTreeChangeAsAdminPassesSecurity(HttpMethod method, String path) {
        assertPassesSecurity("Power.Admin", method, path);
    }

    /**
     * While editing a profile a consultant puts a new skill into "Other" and adds versions (#178)
     */
    @Test
    void newSkillAndVersionAsUserPassSecurity() {
        assertPassesSecurity("Power.User", HttpMethod.POST, "/pwr-skill-service/skill?qualifier=Helm");
        assertPassesSecurity("Power.User", HttpMethod.POST, "/pwr-skill-service/skill/1/version");
    }

    /**
     * Uploading, changing and deleting report templates and their files (#203)
     */
    static Stream<Arguments> templateChanges() {
        return Stream.of(
                Arguments.of(HttpMethod.POST, "/pwr-view-profile-service/admin/template"),
                Arguments.of(HttpMethod.POST, "/pwr-view-profile-service/admin/template/1"),
                Arguments.of(HttpMethod.DELETE, "/pwr-view-profile-service/admin/template/1"),
                Arguments.of(HttpMethod.POST, "/pwr-report-service/admin/file"),
                Arguments.of(HttpMethod.GET, "/pwr-report-service/admin/file"),
                Arguments.of(HttpMethod.GET, "/pwr-report-service/admin/file/1"),
                Arguments.of(HttpMethod.DELETE, "/pwr-report-service/admin/file/1"));
    }

    @ParameterizedTest
    @MethodSource("templateChanges")
    void templateChangeAsUserIsForbidden(HttpMethod method, String path) {
        webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority("Power.User")))
                .method(method).uri(path).exchange().expectStatus().isForbidden();
    }

    @ParameterizedTest
    @MethodSource("templateChanges")
    void templateChangeAsAdminPassesSecurity(HttpMethod method, String path) {
        assertPassesSecurity("Power.Admin", method, path);
    }

    /**
     * Choosing a template, exporting and previewing stay open to every consultant (#203)
     */
    @Test
    void readingTemplatesAndExportingAsUserPassSecurity() {
        assertPassesSecurity("Power.User", "/pwr-view-profile-service/template");
        assertPassesSecurity("Power.User", "/pwr-view-profile-service/template/1");
        assertPassesSecurity("Power.User", HttpMethod.POST, "/pwr-view-profile-service/view/abc/view/1/t1/report");
        assertPassesSecurity("Power.User", "/pwr-view-profile-service/view/abc/view/1/t1/preview");
    }

    private void assertPassesSecurity(String role, String path) {
        assertPassesSecurity(role, HttpMethod.GET, path);
    }

    private void assertPassesSecurity(String role, HttpMethod method, String path) {
        var status = webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority(role)))
                .method(method).uri(path).exchange()
                .returnResult(Void.class).getStatus();
        assertThat(status.value()).as(method + " " + path).isNotIn(401, 403);
    }
}
