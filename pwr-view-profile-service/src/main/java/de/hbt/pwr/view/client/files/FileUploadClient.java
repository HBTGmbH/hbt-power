package de.hbt.pwr.view.client.files;

import feign.hystrix.FallbackFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Component
@FeignClient(value = "pwr-report-service", fallbackFactory = FileUploadClientFallbackFactory.class)
public interface FileUploadClient {
    @PostMapping("/upload/post")
    ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file);

    @GetMapping("/all")
    ResponseEntity listUploadedFiles(Model model);

    @GetMapping("/files/{filename}")
    ResponseEntity<Resource> serveFile(@PathVariable("filename") String filename);
}


@Component
class FileUploadClientFallbackFactory implements FallbackFactory<FileUploadClient> {
    @Override
    public FileUploadClient create(Throwable cause) {
        return new FileUploadClient() {
            @Override
            public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
                return ResponseEntity.ok("uploading failed " + cause.getMessage());
            }

            @Override
            public ResponseEntity listUploadedFiles(Model model) {
                return ResponseEntity.ok("listUploadedFiles " + cause.getMessage());
            }

            @Override
            public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
                return ResponseEntity.notFound().build();
            }
        };
    }
}