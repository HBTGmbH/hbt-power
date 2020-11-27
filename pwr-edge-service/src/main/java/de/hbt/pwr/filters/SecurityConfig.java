package de.hbt.pwr.filters;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@EnableWebSecurity()
@ConfigurationProperties(prefix = "security-config")
public class SecurityConfig extends WebSecurityConfigurerAdapter {

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

    @Autowired
    public SecurityConfig() {
    }

    @Override
    public void configure(AuthenticationManagerBuilder auth) throws Exception {
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
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .antMatchers(HttpMethod.HEAD, "/**").permitAll()
                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .antMatchers("/pwr-profile-service/api/admin/**").hasAnyAuthority("ROLE_HBT-POWER-ADMINS")
                // Restrict profile picture upload to admins
                .antMatchers(HttpMethod.POST, "/pwr-profile-service/api/admin/profile-pictures").hasAnyAuthority("ROLE_HBT-POWER-ADMINS")
                .antMatchers(HttpMethod.DELETE, "/pwr-profile-service/api/admin/profile-pictures").hasAnyAuthority("ROLE_HBT-POWER-ADMINS")
                .antMatchers("/pwr-profile-service/**").permitAll()
                .antMatchers("/pwr-profile-service/api/consultants/**").permitAll()
                .antMatchers("/pwr-report-service/**").permitAll()
                .antMatchers("/pwr-view-profile-service/**").permitAll()
                .antMatchers("/pwr-skill-service/**").permitAll()
                .antMatchers("/pwr-statistics-service/**").permitAll()
                .antMatchers("/**").authenticated()
                .and()
                .httpBasic()
                .and()
                .csrf().disable();
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
