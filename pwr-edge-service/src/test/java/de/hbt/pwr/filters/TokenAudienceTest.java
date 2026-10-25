package de.hbt.pwr.filters;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.time.Instant;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Checks the audience of real, signed tokens (#324). {@link SecurityConfigTest} checks the path rules with mockJwt(),
 * which bypasses the decoder and so the validation of the token. The test decoder knows the key of the test instead
 * of loading the keys from the issuer, the validation is the one of {@link JwtDecoderConfig}.
 */
@SpringBootTest(properties = {"pwr.url.profile=http://localhost:1", "pwr.url.skill=http://localhost:1",
        "pwr.url.view-profile=http://localhost:1", "pwr.url.report=http://localhost:1",
        "pwr.url.statistics=http://localhost:1",
        "spring.security.oauth2.resourceserver.jwt.issuer-uri=" + TokenAudienceTest.ISSUER,
        "pwr.security.jwt.audiences=" + TokenAudienceTest.CLIENT_ID + "," + TokenAudienceTest.APP_ID_URI})
@AutoConfigureWebTestClient
class TokenAudienceTest {

    static final String ISSUER = "https://issuer.test/tenant/v2.0";
    static final String CLIENT_ID = "power-client-id";
    static final String APP_ID_URI = "api://power-client-id";

    private static final String USER_PATH = "/pwr-profile-service/consultants/abc";
    private static final String ADMIN_PATH = "/pwr-profile-service/admin/consultants";

    private static final RSAKey KEY = generateKey();

    @TestConfiguration
    static class TestDecoder {
        @Bean
        @Primary
        ReactiveJwtDecoder testJwtDecoder() throws JOSEException {
            NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder.withPublicKey(KEY.toRSAPublicKey()).build();
            decoder.setJwtValidator(JwtDecoderConfig.validator(ISSUER, List.of(CLIENT_ID, APP_ID_URI)));
            return decoder;
        }
    }

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void userTokenForPowerPassesSecurity() {
        assertPassesSecurity(token(ISSUER, List.of(CLIENT_ID), "Power.User"), USER_PATH);
    }

    @Test
    void adminTokenForPowerPassesSecurity() {
        assertPassesSecurity(token(ISSUER, List.of(CLIENT_ID), "Power.Admin"), ADMIN_PATH);
    }

    @Test
    void theApplicationIdUriCountsAsAudienceToo() {
        assertPassesSecurity(token(ISSUER, List.of(APP_ID_URI), "Power.User"), USER_PATH);
    }

    @Test
    void oneMatchingAudienceAmongOthersIsEnough() {
        assertPassesSecurity(token(ISSUER, List.of("another-api", CLIENT_ID), "Power.User"), USER_PATH);
    }

    @Test
    void userTokenForAnotherAudienceIsUnauthorized() {
        assertUnauthorized(token(ISSUER, List.of("another-api"), "Power.User"), USER_PATH);
    }

    @Test
    void adminTokenForAnotherAudienceIsUnauthorized() {
        assertUnauthorized(token(ISSUER, List.of("another-api"), "Power.Admin"), ADMIN_PATH);
    }

    @Test
    void tokenWithoutAudienceIsUnauthorized() {
        assertUnauthorized(token(ISSUER, List.of(), "Power.Admin"), ADMIN_PATH);
        assertUnauthorized(token(ISSUER, List.of(), "Power.User"), USER_PATH);
    }

    @Test
    void tokenOfAnotherIssuerStaysUnauthorized() {
        assertUnauthorized(token("https://issuer.test/other/v2.0", List.of(CLIENT_ID), "Power.Admin"), ADMIN_PATH);
    }

    @Test
    void edgeDoesNotStartWithoutAudience() {
        new ApplicationContextRunner()
                .withUserConfiguration(JwtDecoderConfig.class)
                .withPropertyValues("spring.security.oauth2.resourceserver.jwt.issuer-uri=" + ISSUER)
                .run(context -> assertThat(context).hasFailed()
                        .getFailure().hasRootCauseInstanceOf(IllegalStateException.class)
                        .hasStackTraceContaining("pwr.security.jwt.audiences"));
    }

    @Test
    void edgeStartsWithIssuerAndAudienceWithoutReachingTheIssuer() {
        new ApplicationContextRunner()
                .withUserConfiguration(JwtDecoderConfig.class)
                .withPropertyValues("spring.security.oauth2.resourceserver.jwt.issuer-uri=" + ISSUER,
                        "pwr.security.jwt.audiences=" + CLIENT_ID)
                .run(context -> assertThat(context).hasNotFailed().hasSingleBean(ReactiveJwtDecoder.class));
    }

    private void assertPassesSecurity(String token, String path) {
        var status = webTestClient.get().uri(path).header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .exchange().returnResult(Void.class).getStatus();
        assertThat(status.value()).as("GET " + path).isNotIn(401, 403);
    }

    private void assertUnauthorized(String token, String path) {
        webTestClient.get().uri(path).header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .exchange().expectStatus().isUnauthorized();
    }

    private static String token(String issuer, List<String> audiences, String role) {
        Instant now = Instant.now();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(issuer)
                .audience(audiences)
                .subject("someone")
                .claim("roles", List.of(role))
                .issueTime(Date.from(now))
                .notBeforeTime(Date.from(now))
                .expirationTime(Date.from(now.plusSeconds(600)))
                .build();
        try {
            SignedJWT jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(KEY.getKeyID()).build(), claims);
            jwt.sign(new RSASSASigner(KEY));
            return jwt.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException(e);
        }
    }

    private static RSAKey generateKey() {
        try {
            return new RSAKeyGenerator(2048).keyID("test").generate();
        } catch (JOSEException e) {
            throw new IllegalStateException(e);
        }
    }
}
