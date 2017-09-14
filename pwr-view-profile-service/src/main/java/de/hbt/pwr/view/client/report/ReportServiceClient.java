package de.hbt.pwr.view.client.report;

import de.hbt.pwr.view.client.report.model.ReportInfo;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = "pwr-report-service")
public interface ReportServiceClient {
    @PostMapping("/report")
    ResponseEntity<String> generateReport(@RequestBody ReportInfo reportInfo, @RequestParam("type") String type);
}
