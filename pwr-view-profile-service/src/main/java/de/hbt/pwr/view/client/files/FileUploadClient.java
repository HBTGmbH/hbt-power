package de.hbt.pwr.view.client.files;

import feign.Headers;
import feign.hystrix.FallbackFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Component
@FeignClient(value = "pwr-report-service", fallbackFactory = FileUploadClientFallbackFactory.class)
public interface FileUploadClient {
    @PostMapping("/upload/post")
    @Headers("Content-Type: multipart/form-data")
    ResponseEntity<List<String>> uploadFile(@RequestParam("file") MultipartFile file);

    @GetMapping("/all")
    ResponseEntity listUploadedFiles(Model model);

    @GetMapping(value = "/files/{filename:.+}")
    @ResponseBody
    ResponseEntity<Resource> serveFile(@PathVariable("filename") String filename);
}


@Component
class FileUploadClientFallbackFactory implements FallbackFactory<FileUploadClient> {
    @Override
    public FileUploadClient create(Throwable cause) {
        return new FileUploadClient() {
            @Override
            public ResponseEntity<List<String>> uploadFile(@RequestParam("file") MultipartFile file) {
                List<String> res  = new ArrayList<>();
                res.add("uploading failed " + cause.getMessage());
                return ResponseEntity.ok(res);
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