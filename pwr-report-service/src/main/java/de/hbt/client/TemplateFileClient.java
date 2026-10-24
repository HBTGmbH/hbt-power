package de.hbt.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Set;

/**
 * Which stored files the report templates of the view-profile service point to (#242)
 */
@Service
public class TemplateFileClient {

    @Value("${pwr-view-profile-service-url}")
    private String pwrViewProfileServiceUrl;

    private final RestTemplate restTemplate;

    public TemplateFileClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * The ids of the files and previews of all templates; throws if the view-profile service does not answer
     */
    public Set<String> findReferencedFileIds() {
        String[] ids = restTemplate.getForObject(pwrViewProfileServiceUrl + "/admin/template/files", String[].class);
        return Set.copyOf(List.of(ids == null ? new String[0] : ids));
    }
}
