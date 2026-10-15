package de.hbt.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ProfilePictureClient {

    @Value("${pwr-profile-service-url}")
    private String pwrProfileServiceUrl;

    private final RestTemplate restTemplate;

    public ProfilePictureClient() {
        restTemplate = new RestTemplate();
    }

    public ResponseEntity<byte[]> getPictureByInitials(@PathVariable("initials") String initials) {
        return restTemplate.exchange(pwrProfileServiceUrl + "/profile-pictures/by-initials/{initials}",
                HttpMethod.GET,
                new HttpEntity<>(null),
                new ParameterizedTypeReference<>() {
                },
                Map.of("initials", initials)
        );
    }
}
