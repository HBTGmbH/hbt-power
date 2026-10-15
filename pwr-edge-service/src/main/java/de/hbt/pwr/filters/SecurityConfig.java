package de.hbt.pwr.filters;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtGrantedAuthoritiesConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity()
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain configure(ServerHttpSecurity http) {
        return http.authorizeExchange()
                // Static content => needs to be deliverable
                .pathMatchers(HttpMethod.GET, "/pwr-profile-service/profile-pictures/**").permitAll()
                // Only admins can do admin things
                .pathMatchers("/pwr-profile-service/api/admin/**").hasAnyAuthority("Power.Admin")
                .pathMatchers("/pwr-profile-service/admin/**").hasAnyAuthority("Power.Admin")
                .pathMatchers("/pwr-profile-service/consultants/info").hasAnyAuthority("Power.Admin")
                // Users and admins can access everything.
                .pathMatchers("/**").hasAnyAuthority("Power.User", "Power.Admin")
                .and()
                .oauth2ResourceServer()
                    .jwt()
                    .and()
                .and()
                .csrf().disable()
                .cors(corsSpec -> corsSpec.configurationSource(new SeriouslyFuckItCorsFilter()))
                .build();
    }

    @Bean
    public ReactiveJwtAuthenticationConverter reactiveJwtAuthenticationConverter() {
        var authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("roles");
        authoritiesConverter.setAuthorityPrefix("");
        var reactiveAuthoritiesConverter = new ReactiveJwtGrantedAuthoritiesConverterAdapter(authoritiesConverter);
        ReactiveJwtAuthenticationConverter converter = new ReactiveJwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(reactiveAuthoritiesConverter);
        return converter;
    }
}
