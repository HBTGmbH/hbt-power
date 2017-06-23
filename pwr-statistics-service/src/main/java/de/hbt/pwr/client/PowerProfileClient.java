package de.hbt.pwr.client;

import de.hbt.pwr.model.profile.Consultant;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

@Component
@FeignClient(value = "pwr-profile-service", fallback = PowerProfileClientFallback.class )
public interface PowerProfileClient {
    @RequestMapping(value = "/api/consultants", method = RequestMethod.GET, produces = "application/json")
    List<Consultant> getAllConsultants();
}
