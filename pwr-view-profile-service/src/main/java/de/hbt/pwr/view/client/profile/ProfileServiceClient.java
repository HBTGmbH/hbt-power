package de.hbt.pwr.view.client.profile;

import de.hbt.pwr.view.client.profile.model.ConsultantInfo;
import de.hbt.pwr.view.client.profile.model.Profile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ProfileServiceClient {

    @Value("${pwr-profile-service-url}")
    private String pwrProfileServiceUrl;

    private final RestTemplate restTemplate;

    public ProfileServiceClient() {
        restTemplate = new RestTemplate();
    }

    @GetMapping("/profiles/{initials}")
    public Profile getSingleProfile(@PathVariable("initials") String initials) {
        return restTemplate.exchange(pwrProfileServiceUrl + "/profiles/{initials}",
                HttpMethod.GET,
                new HttpEntity<>(null),
                Profile.class,
                Map.of("initials", initials)
        ).getBody();
    }

    @GetMapping("/consultants/{initials}")
    public ResponseEntity<ConsultantInfo> findByInitials(@PathVariable("initials") String initials) {
        return restTemplate.exchange(pwrProfileServiceUrl + "/consultants/{initials}",
                HttpMethod.GET,
                new HttpEntity<>(null),
                ConsultantInfo.class,
                Map.of("initials", initials)
        );
    }

}
