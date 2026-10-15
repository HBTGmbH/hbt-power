package de.hbt.pwr.filters;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Because "Same Origin Policy" is annoying. We don't have any security-relevant features and aren't storing
 * anything in client that can be exploited, so we can allow any origin to access our API,
 * even with credentials.
 *
 * This filter does two things: It handles preflight requests with spring security (CorsConfigurationSource) and
 * it adds CORS headers to non-preflight responses as part of the GatewayFilter. Make sure that his Filter
 * is registered as last filter in your gateway filter config
 */
public class SeriouslyFuckItCorsFilter implements GatewayFilter, CorsConfigurationSource {

    private void killAllDownstreamCorsHeaders(ServerWebExchange exchange) {
        exchange.getResponse().getHeaders().remove("Access-Control-Allow-Origin");
        exchange.getResponse().getHeaders().remove("Access-Control-Allow-Headers");
        exchange.getResponse().getHeaders().remove("Access-Control-Allow-Methods");
        exchange.getResponse().getHeaders().remove("Access-Control-Allow-Credentials");
    }

    private String originOf(ServerHttpRequest request) {
        HttpHeaders headers = request.getHeaders();
        return Stream.ofNullable(headers.get("Origin"))
                .flatMap(Collection::stream)
                .findAny()
                .orElse("*");
    }

    private List<String> allStupidHeaders(ServerWebExchange exchange) {
        return new ArrayList<>(exchange.getRequest().getHeaders().keySet());
    }

    private String method(ServerWebExchange exchange) {
        return exchange.getRequest().getMethodValue();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        try {
            killAllDownstreamCorsHeaders(exchange);
            exchange.getResponse().getHeaders().add("Access-Control-Allow-Origin", originOf(exchange.getRequest()));
            exchange.getResponse().getHeaders().add("Access-Control-Allow-Methods", method(exchange));
            exchange.getResponse().getHeaders().add("Access-Control-Allow-Credentials", "true");
            exchange.getResponse().getHeaders().addAll("Access-Control-Allow-Headers", allStupidHeaders(exchange));
        } catch (UnsupportedOperationException ignored) {
            // Happens if we have immutable response (in case of websocket)
        }
        return chain.filter(exchange);
    }

    private List<String> whateverHeadersYouWant(ServerHttpRequest serverHttpRequest) {
        return Stream.ofNullable(serverHttpRequest.getHeaders().get("Access-Control-Request-Headers"))
                .flatMap(Collection::stream)
                .flatMap(header -> Stream.of(header.split(",")))
                .collect(Collectors.toList());
    }

    private List<String> whateverMethodsYouWant() {
        return Stream.of(HttpMethod.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    @Override
    public CorsConfiguration getCorsConfiguration(ServerWebExchange serverWebExchange) {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin(originOf(serverWebExchange.getRequest()));
        config.setAllowedHeaders(whateverHeadersYouWant(serverWebExchange.getRequest()));
        config.setAllowedMethods(whateverMethodsYouWant());
        config.setAllowCredentials(true);
        return config;
    }
}
