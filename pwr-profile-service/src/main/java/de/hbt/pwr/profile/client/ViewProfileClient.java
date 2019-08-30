package de.hbt.pwr.profile.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

@Component
@FeignClient(value = "pwr-view-profile-service")
public interface ViewProfileClient {
    @RequestMapping(method = RequestMethod.DELETE, path = "/view/{initials}/{id}")
    ResponseEntity deleteViewProfile(@PathVariable("initials") String initials, @PathVariable("id") String id);


    @GetMapping(path = "view/{initials}")
    ResponseEntity<List<String>> getAllViewProfiles(@PathVariable("initials") String initials);
}
