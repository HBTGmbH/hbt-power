package de.hbt.pwr.filters;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Rejects every path that is not normalized with {@code 400}, before the security filter (#260). The path rules of
 * {@link SecurityConfig} see the path as it comes in, the service behind normalizes it itself (Tomcat, Spring MVC):
 * {@code /pwr-profile-service/x/../admin/…} is no admin path here but one there. So only paths both read alike pass.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class NormalizedPathFilter implements WebFilter {

    /**
     * Encoded characters that never need encoding (RFC 3986 unreserved), an encoded {@code %}, {@code ;}, slash or
     * backslash
     */
    private static final Pattern SUSPICIOUS_ENCODING =
            Pattern.compile("%(?:[46][1-9a-f]|[57][0-9a]|3[0-9]|2d|2e|5f|7e|25|3b|2f|5c)");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        if (isNormalized(exchange.getRequest().getURI().getRawPath())) {
            return chain.filter(exchange);
        }
        exchange.getResponse().setStatusCode(HttpStatus.BAD_REQUEST);
        return exchange.getResponse().setComplete();
    }

    static boolean isNormalized(String rawPath) {
        if (rawPath == null || rawPath.isEmpty()) {
            return true;
        }
        if (rawPath.contains("//") || rawPath.contains(";") || rawPath.contains("\\")) {
            return false;
        }
        if (SUSPICIOUS_ENCODING.matcher(rawPath.toLowerCase(Locale.ROOT)).find()) {
            return false;
        }
        for (String segment : rawPath.split("/")) {
            if (segment.equals(".") || segment.equals("..")) {
                return false;
            }
        }
        return true;
    }
}
