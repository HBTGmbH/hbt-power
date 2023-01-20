package de.hbt.pwr;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;


@Data
@Configuration
@ConfigurationProperties(prefix = "pwr")
public class PwrEdgeConfig {
    @Data
    public static class Url {
        private String profile = "http://pwr-profile-service:9004";
        private String report = "http://pwr-report-service:9005";
        private String skill = "http://pwr-skill-service:9003";
        private String viewProfile = "http://pwr-view-profile-service:9008";
        private String statistics = "http://pwr-view-profile-service:9009";
    }

    private Url url = new Url();
}
