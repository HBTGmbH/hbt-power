package de.hbt.pwr.view.client.files;

import de.hbt.pwr.view.model.UploadFileResponse;
import feign.Headers;
import feign.Param;
import feign.hystrix.FallbackFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Component
@FeignClient(value = "pwr-report-service", fallbackFactory = FileUploadClientFallbackFactory.class)
public interface FileUploadClient {

    @PostMapping(value = "file", consumes = "multipart/form-data")
    @Headers("content-type: multipart/form-data")
    ResponseEntity<UploadFileResponse> uploadFile(@Param("file") MultipartFile file);

    @GetMapping("file")
    ResponseEntity<Map<String,String>> listUploadedFiles();

    @GetMapping("file/{fileId}")
    @ResponseBody
    ResponseEntity<Resource> serveFile(@PathVariable("fileId") String filename);
}


@Component
class FileUploadClientFallbackFactory implements FallbackFactory<FileUploadClient> {
    @Override
    public FileUploadClient create(Throwable cause) {
        return new FileUploadClient() {
            @Override
            public ResponseEntity<UploadFileResponse> uploadFile(@Param("file") MultipartFile file) {
                return ResponseEntity.badRequest().build();
            }

            @Override
            public ResponseEntity listUploadedFiles() {
                return ResponseEntity.ok("Listing of uploaded files failed: " + cause.getMessage());
            }

            @Override
            public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
                return ResponseEntity.notFound().build();
            }
        };
    }
}