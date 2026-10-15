package de.hbt.pwr.profile.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ViewProfileClient {

    private static final ParameterizedTypeReference<List<String>> LIST_OF_STRING = new ParameterizedTypeReference<>() {};
    
    @Value("${pwr-view-profile-service-url}")
    private String pwrViewProfileServiceUrl;
    private final RestTemplate restTemplate;
    public ViewProfileClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void deleteViewProfile(String initials, String id) {
        restTemplate.exchange(pwrViewProfileServiceUrl + "/view/{initials}/{id}",
                HttpMethod.DELETE,
                new HttpEntity<>(null),
                Void.class,
                Map.of("initials", initials, "id", id)
        );
    }

    public List<String> getAllViewProfiles(@PathVariable("initials") String initials) {
        return restTemplate.exchange(pwrViewProfileServiceUrl + "/view/{initials}",
                HttpMethod.GET,
                new HttpEntity<>(null),
                LIST_OF_STRING,
                Map.of("initials", initials)
        ).getBody();
    }
}
