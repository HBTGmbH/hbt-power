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

import java.net.URI;
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
                .get().uri("/pwr-profile-service/admin/consultants").exchange().expectStatus().isForbidden();
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

    /**
     * Reloading the consultants of the statistics (#205)
     */
    @Test
    void statisticsRefreshAsUserIsForbidden() {
        webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority("Power.User")))
                .post().uri("/pwr-statistics-service/admin/consultants/refresh").exchange().expectStatus().isForbidden();
    }

    @Test
    void statisticsRefreshAsAdminPassesSecurity() {
        assertPassesSecurity("Power.Admin", HttpMethod.POST, "/pwr-statistics-service/admin/consultants/refresh");
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

    /**
     * Personal data of other consultants and changing profile pictures, only for the admin area (#255)
     */
    static Stream<Arguments> adminOnlyPersonalData() {
        return Stream.of(
                Arguments.of(HttpMethod.POST, "/pwr-profile-service/admin/profile-pictures"),
                Arguments.of(HttpMethod.DELETE, "/pwr-profile-service/admin/profile-pictures/some-id"),
                Arguments.of(HttpMethod.GET, "/pwr-statistics-service/admin/statistics/skill/referencing?skill=Java"),
                Arguments.of(HttpMethod.GET, "/pwr-statistics-service/admin/statistics/entries/referencing?name-entity=x&type=SECTOR"),
                Arguments.of(HttpMethod.GET, "/pwr-statistics-service/admin/statistics/network/kmed"));
    }

    @ParameterizedTest
    @MethodSource("adminOnlyPersonalData")
    void adminOnlyPersonalDataAsUserIsForbidden(HttpMethod method, String path) {
        webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority("Power.User")))
                .method(method).uri(path).exchange().expectStatus().isForbidden();
    }

    @ParameterizedTest
    @MethodSource("adminOnlyPersonalData")
    void adminOnlyPersonalDataAsAdminPassesSecurity(HttpMethod method, String path) {
        assertPassesSecurity("Power.Admin", method, path);
    }

    /**
     * Listing and managing the consultants (#218)
     */
    static Stream<Arguments> consultantManagement() {
        return Stream.of(
                Arguments.of(HttpMethod.GET, "/pwr-profile-service/admin/consultants"),
                Arguments.of(HttpMethod.GET, "/pwr-profile-service/admin/consultants/info"),
                Arguments.of(HttpMethod.POST, "/pwr-profile-service/admin/consultants"),
                Arguments.of(HttpMethod.PATCH, "/pwr-profile-service/admin/consultants/abc"),
                Arguments.of(HttpMethod.DELETE, "/pwr-profile-service/admin/consultants/abc"));
    }

    @ParameterizedTest
    @MethodSource("consultantManagement")
    void consultantManagementAsUserIsForbidden(HttpMethod method, String path) {
        webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority("Power.User")))
                .method(method).uri(path).exchange().expectStatus().isForbidden();
    }

    @ParameterizedTest
    @MethodSource("consultantManagement")
    void consultantManagementAsAdminPassesSecurity(HttpMethod method, String path) {
        assertPassesSecurity("Power.Admin", method, path);
    }

    /**
     * One consultant (the own profile) and the names of all (#216) stay open to every consultant
     */
    @Test
    void consultantAndNamesAsUserPassSecurity() {
        assertPassesSecurity("Power.User", "/pwr-profile-service/consultants/abc");
        assertPassesSecurity("Power.User", "/pwr-profile-service/consultants/names");
    }

    /**
     * Paths the edge reads differently than the service behind, which normalizes them (#260): rejected before the
     * path rules, also for an admin
     */
    static Stream<String> pathsThatAreNotNormalized() {
        return Stream.of(
                "/pwr-profile-service/profile/../admin/consultants",
                "/pwr-profile-service/profile/./../admin/consultants",
                "/pwr-profile-service/profile/%2e%2e/admin/consultants",
                "/pwr-profile-service/profile/%2E%2E/admin/consultants",
                "/pwr-profile-service/profile/.%2e/admin/consultants",
                "/pwr-profile-service/profile/%252e%252e/admin/consultants",
                "/pwr-profile-service/profile%2f..%2fadmin/consultants",
                "/pwr-profile-service/profile/..%5cadmin/consultants",
                "/pwr-profile-service//admin/consultants",
                "/pwr-profile-service/admin;x/consultants",
                "/pwr-profile-service/admin%3bx/consultants",
                "/pwr-profile-service/%61dmin/consultants",
                "/pwr-statistics-service/statistics/../admin/consultants/refresh",
                "/pwr-skill-service/skill/../admin/skill/lucene/index");
    }

    @ParameterizedTest
    @MethodSource("pathsThatAreNotNormalized")
    void pathThatIsNotNormalizedIsRejected(String rawPath) {
        webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority("Power.User")))
                .get().uri(URI.create(rawPath)).exchange().expectStatus().isBadRequest();
        webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority("Power.Admin")))
                .get().uri(URI.create(rawPath)).exchange().expectStatus().isBadRequest();
    }

    @Test
    void encodedCharactersInNamesStillPass() {
        assertPassesSecurity("Power.User", URI.create("/pwr-view-profile-service/view/abc/view/1/parent/C%23"));
        assertPassesSecurity("Power.User", URI.create("/pwr-skill-service/skill/search?searchterm=C%23&maxResults=10"));
        assertPassesSecurity("Power.User", URI.create("/pwr-view-profile-service/view/abc/view/1/parent/.NET"));
        assertPassesSecurity("Power.User", URI.create("/pwr-view-profile-service/view/abc/view/1/parent/Visual%20Basic"));
        assertPassesSecurity("Power.Admin", URI.create("/pwr-profile-service/admin/skills?name=C%23"));
    }

    private void assertPassesSecurity(String role, URI uri) {
        var status = webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority(role)))
                .get().uri(uri).exchange()
                .returnResult(Void.class).getStatus();
        assertThat(status.value()).as("GET " + uri).isNotIn(400, 401, 403);
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
