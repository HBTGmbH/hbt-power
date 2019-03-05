package de.hbt.pwr.view.client.profile;

import de.hbt.pwr.view.client.profile.model.ConsultantInfo;
import de.hbt.pwr.view.client.profile.model.Profile;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(value = "pwr-profile-service")
public interface ProfileServiceClient {

    @GetMapping("/profiles/{initials}")
    Profile getSingleProfile(@PathVariable("initials") String initials);

    @GetMapping("/consultants/{initials}")
    ResponseEntity<ConsultantInfo> findByInitials(@PathVariable("initials") String initials);

}
