package de.hbt.pwr.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Registers the check of the consultant in the path (#255). The cluster info of a consultant stays open to every user.
 */
@Configuration
public class ConsultantAccessConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new ConsultantAccessInterceptor())
                .excludePathPatterns("/statistics/network/consultant/**");
    }
}
