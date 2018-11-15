package de.hbt.pwr.view.client.report;

import de.hbt.pwr.view.client.report.model.ReportInfo;
import feign.hystrix.FallbackFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = "pwr-report-service", fallbackFactory = ReportServiceClientFallbackFactory.class)
public interface ReportServiceClient {
    @PostMapping("/report")
    ResponseEntity<String> generateReport(@RequestBody ReportInfo reportInfo,
                                          @RequestParam("type") String type,
                                          @RequestParam(value = "charsperline", required = false) Integer charsPerLine);

    @PostMapping(value = "/report/preview", produces = "text/plain", consumes = "text/plain")
    ResponseEntity<String> generateHtml(@RequestParam("path") String templatePath);


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
        };
    }
}