package de.hbt.pwr.view.client.report;

import de.hbt.pwr.view.client.report.model.ReportInfo;
import feign.hystrix.FallbackFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Component
@FeignClient(value = "pwr-report-service", fallbackFactory = ReportServiceClientFallbackFactory.class)
public interface ReportServiceClient {
    @PostMapping("/report")
    ResponseEntity<String> generateReport(@RequestBody ReportInfo reportInfo,
                                          @RequestParam("type") String type,
                                          @RequestParam(value = "charsperline", required = false) Integer charsPerLine);

    @PostMapping(value = "/report/preview", produces = "text/plain", consumes = "text/plain")
    ResponseEntity<String> generateHtml(@RequestParam("path") String templatePath);


    @GetMapping(value = "/files/{filename}", produces = "text/html")
    ResponseEntity<Resource> serveFile(@PathVariable("filename") String filename);


    @PostMapping(value = "/upload/post",headers = "multipart/form-data", produces = "multipart/form-data")
    ResponseEntity<String> uploadFile(@RequestParam("file")MultipartFile file);

}


@Component
class ReportServiceClientFallbackFactory implements FallbackFactory<ReportServiceClient> {
    @Override
    public ReportServiceClient create(Throwable cause) {
        return new ReportServiceClient() {
            @Override
            public ResponseEntity<String> generateReport(ReportInfo reportInfo, String type, Integer charsPerLine) {
                return ResponseEntity.ok("generateReport Failed: "+cause.getMessage());
            }

            @Override
            public ResponseEntity<String> generateHtml(String templatePath) {
                return ResponseEntity.ok("generateHtml Failed: "+cause.getMessage());
            }

            @Override
            public ResponseEntity<Resource> serveFile(@PathVariable("filename") String filename){
                return ResponseEntity.badRequest().build();
            }

            @Override
            public ResponseEntity<String> uploadFile(@RequestParam("file")MultipartFile file){
                return ResponseEntity.unprocessableEntity().build();
            }
        };
    }
}