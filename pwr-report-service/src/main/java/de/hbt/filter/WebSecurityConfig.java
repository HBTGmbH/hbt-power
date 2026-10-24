package de.hbt.filter;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * Spring Security without authentication, on purpose (ADR-24, #256): like every backend service, the report service
 * trusts the headers of the edge and checks the consultant itself (<code>security/ConsultantAccess</code>). What
 * Spring Security still brings is its firewall, which rejects paths that are not normalized (<code>..</code>,
 * <code>;</code>, encoded slashes) before they reach a controller, and its security headers on every response.
 */
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .headers()
                .frameOptions()
                .disable();
    }
}
