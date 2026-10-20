package de.hbt.pwr;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockJwt;

/**
 * Spring Security adds "no-cache, no-store" to every response, unless the response already has caching headers. The
 * cache header of a profile picture must reach the browser unchanged.
 */
@SpringBootTest
@AutoConfigureWebTestClient
class ProfilePictureCachingTest {

    private static final String CACHE_CONTROL = "max-age=31536000, private, immutable";

    private static final HttpServer profileService = startProfileService();

    @Autowired
    private WebTestClient webTestClient;

    // No issuer is configured in tests; mockJwt() bypasses the decoder
    @MockBean
    private ReactiveJwtDecoder jwtDecoder;

    @DynamicPropertySource
    static void routeToProfileService(DynamicPropertyRegistry registry) {
        registry.add("pwr.url.profile", () -> "http://localhost:" + profileService.getAddress().getPort());
    }

    @AfterAll
    static void stopProfileService() {
        profileService.stop(0);
    }

    @Test
    void cacheHeaderOfProfilePicturePassesTheEdge() {
        webTestClient.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority("Power.User")))
                .get().uri("/pwr-profile-service/profile-pictures/some-id").exchange()
                .expectStatus().isOk()
                .expectHeader().valueEquals("Cache-Control", CACHE_CONTROL)
                .expectHeader().doesNotExist("Pragma")
                .expectHeader().doesNotExist("Expires");
    }

    private static HttpServer startProfileService() {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
            server.createContext("/profile-pictures/", exchange -> {
                byte[] picture = {1, 2, 3};
                exchange.getResponseHeaders().add("Content-Type", "image/png");
                exchange.getResponseHeaders().add("Cache-Control", CACHE_CONTROL);
                exchange.sendResponseHeaders(200, picture.length);
                try (OutputStream body = exchange.getResponseBody()) {
                    body.write(picture);
                }
            });
            server.start();
            return server;
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }
}
