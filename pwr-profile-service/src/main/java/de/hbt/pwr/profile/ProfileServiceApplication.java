package de.hbt.pwr.profile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.Clock;

@SpringBootApplication
public class ProfileServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProfileServiceApplication.class, args);
    }

    /**
     * Replaced by a fixed clock in tests of the profile check (#139)
     */
    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}
