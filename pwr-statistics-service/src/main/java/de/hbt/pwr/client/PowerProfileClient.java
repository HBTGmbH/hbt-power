package de.hbt.pwr.client;

import de.hbt.pwr.model.profile.Consultant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
public class PowerProfileClient {
    private static final ParameterizedTypeReference<List<Consultant>> LIST_OF_CONSULTANT = new ParameterizedTypeReference<List<Consultant>>() {
    };

    private final RestTemplate restTemplate;

    @Value("${pwr-profile-service-url}")
    private String pwrProfileServiceUrl;

    public PowerProfileClient() {
        this.restTemplate = new RestTemplate();
    }

    public List<Consultant> getAllConsultants() {
        return restTemplate.exchange(pwrProfileServiceUrl + "/consultants",
                HttpMethod.GET,
                new HttpEntity<>(null),
                LIST_OF_CONSULTANT
        ).getBody();
    }
}
