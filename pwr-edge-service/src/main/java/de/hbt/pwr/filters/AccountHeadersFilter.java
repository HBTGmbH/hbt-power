package de.hbt.pwr.filters;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Optional;

/**
 * Tells the services who is logged in (#139) and whether the account is an admin (#255). They have no authentication
 * of their own, so the account comes from the token this service verified: headers of the same name sent by a client
 * are removed first, so nobody can pretend to be someone else. The admin header is set on every request, so a service
 * can tell a request through this service from a call of another service, which never has it.
 */
@Component
public class AccountHeadersFilter implements GlobalFilter, Ordered {

    public static final String USER_LOGIN_HEADER = "X-Pwr-User-Login";
    public static final String USER_INITIALS_HEADER = "X-Pwr-User-Initials";
    public static final String USER_ADMIN_HEADER = "X-Pwr-User-Admin";
    static final String ADMIN_ROLE = "Power.Admin";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(JwtAuthenticationToken.class::isInstance)
                .map(JwtAuthenticationToken.class::cast)
                .map(Optional::of)
                .defaultIfEmpty(Optional.empty())
                .flatMap(authentication -> chain.filter(withAccount(exchange, authentication)));
    }

    private static ServerWebExchange withAccount(ServerWebExchange exchange, Optional<JwtAuthenticationToken> authentication) {
        Optional<Jwt> token = authentication.map(JwtAuthenticationToken::getToken);
        boolean admin = authentication.stream()
                .flatMap(auth -> auth.getAuthorities().stream())
                .anyMatch(authority -> ADMIN_ROLE.equals(authority.getAuthority()));
        ServerHttpRequest request = exchange.getRequest().mutate()
                .headers(headers -> {
                    headers.remove(USER_LOGIN_HEADER);
                    headers.remove(USER_INITIALS_HEADER);
                    headers.set(USER_ADMIN_HEADER, Boolean.toString(admin));
                    token.flatMap(jwt -> claim(jwt, "preferred_username", "upn", "email"))
                            .ifPresent(login -> headers.set(USER_LOGIN_HEADER, login));
                    token.flatMap(jwt -> claim(jwt, "mailnickname"))
                            .ifPresent(initials -> headers.set(USER_INITIALS_HEADER, initials.toLowerCase()));
                })
                .build();
        return exchange.mutate().request(request).build();
    }

    /**
     * The first claim present, its name compared without regard to case; only printable ASCII, nothing else belongs
     * into a header
     */
    private static Optional<String> claim(Jwt jwt, String... names) {
        Map<String, Object> claims = jwt.getClaims();
        for (String name : names) {
            Optional<String> value = claims.entrySet().stream()
                    .filter(entry -> entry.getKey().equalsIgnoreCase(name))
                    .map(Map.Entry::getValue)
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .map(text -> text.replaceAll("[^\\x20-\\x7E]", "").trim())
                    .filter(text -> !text.isEmpty())
                    .findFirst();
            if (value.isPresent()) {
                return value;
            }
        }
        return Optional.empty();
    }

    /**
     * Before the routing filters, which send the request on
     */
    @Override
    public int getOrder() {
        return 0;
    }
}
