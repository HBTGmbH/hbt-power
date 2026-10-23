package de.hbt.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

/**
 * The name of a consultant from the profile service, for who started an export (#214)
 */
@Service
public class ConsultantNameClient {

    private static final Logger LOG = LogManager.getLogger(ConsultantNameClient.class);

    @Value("${pwr-profile-service-url}")
    private String pwrProfileServiceUrl;

    private final RestTemplate restTemplate;

    public ConsultantNameClient() {
        restTemplate = new RestTemplate();
    }

    /**
     * First and last name; empty if there is no active consultant with these initials or the profile service does
     * not answer, which must not stop the export
     */
    public Optional<String> findFullName(String initials) {
        try {
            ConsultantName consultant = restTemplate.getForObject(pwrProfileServiceUrl + "/consultants/{initials}",
                    ConsultantName.class, Map.of("initials", initials));
            return Optional.ofNullable(consultant).map(ConsultantName::fullName);
        } catch (RestClientException e) {
            LOG.warn("No name for initials " + initials + ": " + e.getMessage());
            return Optional.empty();
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class ConsultantName {
        private String firstName;
        private String lastName;

        String fullName() {
            String name = (Optional.ofNullable(firstName).orElse("") + " " + Optional.ofNullable(lastName).orElse("")).trim();
            return name.isEmpty() ? null : name;
        }
    }
}
