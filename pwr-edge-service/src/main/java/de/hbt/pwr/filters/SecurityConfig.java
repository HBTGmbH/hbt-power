package de.hbt.pwr.filters;

import lombok.SneakyThrows;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DefaultAuthenticationEventPublisher;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.ReactiveAuthenticationManagerAdapter;
import org.springframework.security.config.annotation.ObjectPostProcessor;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configurers.ldap.LdapAuthenticationProviderConfigurer;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.userdetails.DefaultLdapAuthoritiesPopulator;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.server.SecurityWebFilterChain;

import java.util.Arrays;

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

    private final ObjectPostProcessor<Object> objectPostProcessor = new ObjectPostProcessor<>() {

        @SneakyThrows
        @Override
        public <T> T postProcess(T object) {
            if (object instanceof InitializingBean) {
                InitializingBean bean = (InitializingBean) object;
                bean.afterPropertiesSet();
            }
            return object;
        }

    };

    @Bean
    public ReactiveAuthenticationManager authenticationManager() throws Exception {
        AuthenticationManagerBuilder auth = new AuthenticationManagerBuilder(objectPostProcessor);
        auth.ldapAuthentication()
                .userSearchBase(userSearchBase)
                .userSearchFilter(userSearchFilter)
                .groupSearchBase(groupSearchBase)
                .groupSearchFilter(groupSearchFilter)
                .rolePrefix(rolePrefix)
            .contextSource()
                .url(url)
                .managerDn(managerDn)
                .managerPassword(managerPassword);
        return new ReactiveAuthenticationManagerAdapter(auth.build());
    }

    @Bean
    public SecurityWebFilterChain configure(ServerHttpSecurity http) throws Exception {
        return http.authenticationManager(authenticationManager()).authorizeExchange()
                .pathMatchers(HttpMethod.HEAD, "/**").permitAll()
                .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .pathMatchers("/pwr-profile-service/api/admin/**").hasAnyAuthority("ROLE_HBT-POWER-ADMINS")
                // Restrict profile picture upload to admins
                .pathMatchers(HttpMethod.POST, "/pwr-profile-service/api/admin/profile-pictures").hasAnyAuthority("ROLE_HBT-POWER-ADMINS")
                .pathMatchers(HttpMethod.DELETE, "/pwr-profile-service/api/admin/profile-pictures").hasAnyAuthority("ROLE_HBT-POWER-ADMINS")
                .pathMatchers("/pwr-profile-service/**").permitAll()
                .pathMatchers("/pwr-profile-service/api/consultants/**").permitAll()
                .pathMatchers("/pwr-report-service/**").permitAll()
                .pathMatchers("/pwr-view-profile-service/**").permitAll()
                .pathMatchers("/pwr-skill-service/**").permitAll()
                .pathMatchers("/pwr-statistics-service/**").permitAll()
                .pathMatchers("/**").permitAll()
                .and()
                .httpBasic()
                .and()
                .csrf().disable()
                .cors(corsSpec -> corsSpec.configurationSource(new SeriouslyFuckItCorsFilter()))
                .build();
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
