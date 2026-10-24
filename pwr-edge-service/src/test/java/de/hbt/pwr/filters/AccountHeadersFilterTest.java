package de.hbt.pwr.filters;

import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import reactor.core.publisher.Mono;

import java.util.concurrent.atomic.AtomicReference;

import static de.hbt.pwr.filters.AccountHeadersFilter.USER_ADMIN_HEADER;
import static de.hbt.pwr.filters.AccountHeadersFilter.USER_INITIALS_HEADER;
import static de.hbt.pwr.filters.AccountHeadersFilter.USER_LOGIN_HEADER;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * The services learn the account only from the verified token, never from a client's headers (#139)
 */
class AccountHeadersFilterTest {

    private final AccountHeadersFilter filter = new AccountHeadersFilter();

    @Test
    void setsLoginAndInitialsFromTheToken() {
        HttpHeaders forwarded = forward(request(), token("clara.check@example.org", "CHK"));
        assertThat(forwarded.getFirst(USER_LOGIN_HEADER)).isEqualTo("clara.check@example.org");
        assertThat(forwarded.getFirst(USER_INITIALS_HEADER)).isEqualTo("chk");
    }

    @Test
    void replacesHeadersAClientSent() {
        MockServerHttpRequest forged = MockServerHttpRequest.post("/pwr-profile-service/profile/chk/check/confirmation")
                .header(USER_LOGIN_HEADER, "someone.else@example.org")
                .header("x-pwr-user-initials", "xyz")
                .build();
        HttpHeaders forwarded = forward(forged, token("clara.check@example.org", "chk"));
        assertThat(forwarded.get(USER_LOGIN_HEADER)).containsExactly("clara.check@example.org");
        assertThat(forwarded.get(USER_INITIALS_HEADER)).containsExactly("chk");
    }

    @Test
    void removesHeadersAClientSentWithoutToken() {
        MockServerHttpRequest forged = MockServerHttpRequest.get("/pwr-edge-service/actuator/health")
                .header(USER_LOGIN_HEADER, "someone.else@example.org")
                .build();
        HttpHeaders forwarded = forward(forged, null);
        assertThat(forwarded.containsKey(USER_LOGIN_HEADER)).isFalse();
        assertThat(forwarded.containsKey(USER_INITIALS_HEADER)).isFalse();
    }

    @Test
    void tellsWhetherTheAccountIsAnAdmin() {
        assertThat(forward(request(), token("clara.check@example.org", "chk")).get(USER_ADMIN_HEADER))
                .containsExactly("false");
        assertThat(forward(request(), token("ada.admin@example.org", "ada", "Power.User", "Power.Admin"))
                .get(USER_ADMIN_HEADER)).containsExactly("true");
    }

    @Test
    void replacesAnAdminHeaderAClientSent() {
        MockServerHttpRequest forged = MockServerHttpRequest.get("/pwr-profile-service/profile/xyz/fullProfile")
                .header("x-pwr-user-admin", "true")
                .build();
        assertThat(forward(forged, token("clara.check@example.org", "chk", "Power.User")).get(USER_ADMIN_HEADER))
                .containsExactly("false");
        assertThat(forward(forged, null).get(USER_ADMIN_HEADER)).containsExactly("false");
    }

    @Test
    void dropsCharactersThatDontBelongIntoAHeader() {
        HttpHeaders forwarded = forward(request(), token("clara\r\nX-Evil: 1@example.org", null));
        assertThat(forwarded.getFirst(USER_LOGIN_HEADER)).isEqualTo("claraX-Evil: 1@example.org");
        assertThat(forwarded.containsKey(USER_INITIALS_HEADER)).isFalse();
    }

    private HttpHeaders forward(MockServerHttpRequest request, JwtAuthenticationToken token) {
        AtomicReference<HttpHeaders> forwarded = new AtomicReference<>();
        GatewayFilterChain chain = exchange -> {
            forwarded.set(exchange.getRequest().getHeaders());
            return Mono.empty();
        };
        Mono<Void> result = filter.filter(MockServerWebExchange.from(request), chain);
        if (token != null) {
            result = result.contextWrite(ReactiveSecurityContextHolder.withAuthentication(token));
        }
        result.block();
        return forwarded.get();
    }

    private static MockServerHttpRequest request() {
        return MockServerHttpRequest.post("/pwr-profile-service/profile/chk/check/confirmation").build();
    }

    private static JwtAuthenticationToken token(String login, String initials, String... roles) {
        Jwt.Builder jwt = Jwt.withTokenValue("token").header("alg", "none").claim("preferred_username", login);
        if (initials != null) {
            jwt.claim("mailnickname", initials);
        }
        return new JwtAuthenticationToken(jwt.build(), AuthorityUtils.createAuthorityList(roles));
    }
}
