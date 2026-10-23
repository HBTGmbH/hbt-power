package de.hbt.pwr.view.client.profile;

import de.hbt.pwr.view.client.profile.model.ConsultantInfo;
import de.hbt.pwr.view.client.profile.model.FormerName;
import de.hbt.pwr.view.client.profile.model.Profile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Slf4j
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

    /**
     * The former names of renamed and merged profile elements (#230). Empty if the profile service doesn't answer:
     * updating a view profile then finds the entries only under their current names.
     */
    public List<FormerName> getFormerNames() {
        try {
            FormerName[] formerNames = restTemplate.getForObject(pwrProfileServiceUrl + "/admin/name-entities/former-names",
                    FormerName[].class);
            return formerNames == null ? List.of() : Arrays.asList(formerNames);
        } catch (RuntimeException e) {
            log.warn("No former names of profile elements, entries are found under their current names only: " + e.getMessage());
            return List.of();
        }
    }
}
