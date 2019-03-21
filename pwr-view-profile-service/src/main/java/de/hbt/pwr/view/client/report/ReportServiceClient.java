package de.hbt.pwr.view.client.report;

import de.hbt.pwr.view.client.report.model.ReportInfo;
import de.hbt.pwr.view.model.UploadFileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

@Component
@FeignClient(value = "pwr-report-service")
public interface ReportServiceClient {
    @PostMapping("report")
    ResponseEntity<String> generateReport(@RequestBody ReportInfo reportInfo,
                                          @RequestParam("type") String type,
                                          @RequestParam(value = "charsperline", required = false) Integer charsPerLine);

    @GetMapping("pdf/{fileId}")
    ResponseEntity<UploadFileResponse> generatePdf(@PathVariable("fileId") String templatePath);

}