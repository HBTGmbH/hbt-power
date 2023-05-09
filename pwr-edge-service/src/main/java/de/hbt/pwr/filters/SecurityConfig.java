package de.hbt.pwr.filters;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtGrantedAuthoritiesConverterAdapter;
import org.springframework.security.oauth2.server.resource.web.server.ServerBearerTokenAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity()
@ConfigurationProperties(prefix = "security-config")
public class SecurityConfig {

    /**
     * username of the LDAP admin for HBT
     */
    @Value("manager-dn")
    private String managerDn;

    /**
     * Password of the LDAP admin for HBT
     */
    @Value("manager-password")
    private String managerPassword;

    @Value("url")
    private String url;

    @Value("user-search-base")
    private String userSearchBase;

    @Value("user-search-filter")
    private String userSearchFilter;

    @Value("group-search-base")
    private String groupSearchBase;

    @Value("group-search-filter")
    private String groupSearchFilter;

    @Value("role-prefix")
    private String rolePrefix;

    @Bean
    public SecurityWebFilterChain configure(ServerHttpSecurity http) {
        return http.authorizeExchange()
                // Static content => needs to be deliverable
                .pathMatchers(HttpMethod.GET, "/pwr-profile-service/profile-pictures/**").permitAll()
                // Only admins can do admin things
                .pathMatchers("/pwr-profile-service/api/admin/**").hasAnyAuthority("Power.Admin")
                .pathMatchers("/pwr-profile-service/admin/**").hasAnyAuthority("Power.Admin")
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

    private Customizer<ServerHttpSecurity.OAuth2ResourceServerSpec> oAuth2WithAccessToken() {
        return oauth2ResourceServer -> {
            // Okay now we want security on websockets. Sadly, the Websocket protocol does not allow
            // us to send custom headers (because it's a "socket", TCP for the web).
            // What we do have is a the possibility to add query parameters
            // spring allows us to use the access_token query parameter if we set allowUriQueryParameter to true
            // That way, we can send our JsonWebToken (JWT) via access_token query parameter
            ServerBearerTokenAuthenticationConverter serverBearerTokenAuthenticationConverter = new ServerBearerTokenAuthenticationConverter();
            serverBearerTokenAuthenticationConverter.setAllowUriQueryParameter(true);
            oauth2ResourceServer.bearerTokenConverter(serverBearerTokenAuthenticationConverter);
            oauth2ResourceServer.jwt(Customizer.withDefaults());
        };
    }

    public String getManagerDn() {
        return managerDn;
    }

    public void setManagerDn(String managerDn) {
        this.managerDn = managerDn;
    }

    public String getManagerPassword() {
        return managerPassword;
    }

    public void setManagerPassword(String managerPassword) {
        this.managerPassword = managerPassword;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUserSearchBase() {
        return userSearchBase;
    }

    public void setUserSearchBase(String userSearchBase) {
        this.userSearchBase = userSearchBase;
    }


    public String getGroupSearchBase() {
        return groupSearchBase;
    }

    public void setGroupSearchBase(String groupSearchBase) {
        this.groupSearchBase = groupSearchBase;
    }

    public String getGroupSearchFilter() {
        return groupSearchFilter;
    }

    public void setGroupSearchFilter(String groupSearchFilter) {
        this.groupSearchFilter = groupSearchFilter;
    }

    public String getRolePrefix() {
        return rolePrefix;
    }

    public void setRolePrefix(String rolePrefix) {
        this.rolePrefix = rolePrefix;
    }

    public String getUserSearchFilter() {
        return userSearchFilter;
    }

    public void setUserSearchFilter(String userSearchFilter) {
        this.userSearchFilter = userSearchFilter;
    }
}
