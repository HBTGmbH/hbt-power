package de.hbt.pwr;


import de.hbt.pwr.filters.SeriouslyFuckItCorsFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.Buildable;
import org.springframework.cloud.gateway.route.builder.GatewayFilterSpec;
import org.springframework.cloud.gateway.route.builder.PredicateSpec;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.cloud.gateway.route.builder.UriSpec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.function.Function;

@Configuration
@RequiredArgsConstructor
public class PwrRoutingConfig {
    private final PwrEdgeConfig edgeConfig;

    @Bean
    public RouteLocator vdbRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("to-profile", this::toProfile)
                .route("to-skill", this::toSkill)
                .route("to-report", this::toReport)
                .route("to-view-profile", this::toViewProfile)
                .route("to-statistics", this::toStatistics)
                .build();
    }

    private Buildable<Route> toProfile(PredicateSpec p) {
        return p.path("/pwr-profile-service/**")
                .filters(withDefaultFilters())
                .uri(edgeConfig.getUrl().getProfile());
    }

    private Buildable<Route> toSkill(PredicateSpec p) {
        return p.path("/pwr-skill-service/**")
                .filters(withDefaultFilters())
                .uri(edgeConfig.getUrl().getSkill());
    }

    private Buildable<Route> toReport(PredicateSpec p) {
        return p.path("/pwr-report-service/**")
                .filters(withDefaultFilters())
                .uri(edgeConfig.getUrl().getReport());
    }

    private Buildable<Route> toViewProfile(PredicateSpec p) {
        return p.path("/pwr-view-profile-service/**")
                .filters(withDefaultFilters())
                .uri(edgeConfig.getUrl().getViewProfile());
    }

    private Buildable<Route> toStatistics(PredicateSpec p) {
        return p.path("/pwr-statistics-service/**")
                .filters(withDefaultFilters())
                .uri(edgeConfig.getUrl().getStatistics());
    }

    private Function<GatewayFilterSpec, UriSpec> withDefaultFilters() {
        return gatewayFilterSpec -> gatewayFilterSpec
                // We don't need the name of the service we use as prefix
                .stripPrefix(1)
                .filter(new SeriouslyFuckItCorsFilter(), Integer.MAX_VALUE);
    }
}
