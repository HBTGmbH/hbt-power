package de.hbt.pwr.view.client.files;

import de.hbt.pwr.view.model.UploadFileResponse;
import feign.Headers;
import feign.Param;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Component
@FeignClient(value = "pwr-report-service")
public interface FileUploadClient {

    @PostMapping(value = "file", consumes = "multipart/form-data")
    @Headers("content-type: multipart/form-data")
    ResponseEntity<UploadFileResponse> uploadFile(@Param("file") MultipartFile file);

    @GetMapping("file")
    ResponseEntity<Map<String,String>> listUploadedFiles();

    @GetMapping("file/{fileId}")
    @ResponseBody
    ResponseEntity<Resource> serveFile(@PathVariable("fileId") String fileId);

    @DeleteMapping("file/{fileId}")
    ResponseEntity deleteFile(@PathVariable("fileId") String fileId);
}