package de.hbt.pwr.view.client.report;

import de.hbt.pwr.view.client.report.model.ReportInfo;
import de.hbt.pwr.view.model.UploadFileResponse;
import feign.hystrix.FallbackFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

@Component
@FeignClient(value = "pwr-report-service", fallbackFactory = ReportServiceClientFallbackFactory.class)
public interface ReportServiceClient {
    @PostMapping("report")
    ResponseEntity<String> generateReport(@RequestBody ReportInfo reportInfo,
                                          @RequestParam("type") String type,
                                          @RequestParam(value = "charsperline", required = false) Integer charsPerLine);

    @GetMapping("html/{fileId}")
    ResponseEntity<UploadFileResponse> generateHtml(@PathVariable("fileId") String templatePath);

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
            public ResponseEntity generateHtml(String templatePath) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Feign Client failed to generate Html");
            }
        };
    }
}