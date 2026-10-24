package de.hbt.pwr.view.client.files;

import de.hbt.pwr.view.model.UploadFileResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Set;

@Service
public class FileUploadClient {

    @Value("${pwr-report-service-url}")
    private String pwrReportServiceUrl;
    private final RestTemplate restTemplate;

    public FileUploadClient() {
        restTemplate = new RestTemplate();
    }

    public ResponseEntity<UploadFileResponse> uploadFile(MultipartFile file) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.set("file", file.getResource());
        return restTemplate.exchange(pwrReportServiceUrl + "/admin/file",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                new ParameterizedTypeReference<>() {
                }
        );
    }

    public ResponseEntity<Void> deleteFile(String fileId) {
        return restTemplate.exchange(pwrReportServiceUrl + "/admin/file/{fileId}",
                HttpMethod.DELETE,
                new HttpEntity<>(null),
                Void.class,
                Map.of("fileId", fileId)
        );
    }

    /**
     * The ids of all template files the report service stores (#242); throws if it does not answer
     */
    public Set<String> findAllFileIds() {
        Map<String, String> files = restTemplate.exchange(pwrReportServiceUrl + "/admin/file",
                HttpMethod.GET,
                new HttpEntity<>(null),
                new ParameterizedTypeReference<Map<String, String>>() {
                }
        ).getBody();
        return files == null ? Set.of() : Set.copyOf(files.keySet());
    }
}
