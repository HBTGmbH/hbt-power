package de.hbt.controller;

import de.hbt.model.ReportData;
import de.hbt.model.ReportInfo;
import de.hbt.service.ProfileReportService;
import de.hbt.service.ReportDataService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping(value = "/report")
public class ReportController {

    private final ProfileReportService profileReportService;

    private final ReportDataService reportDataService;

    private static final Logger LOG = LogManager.getLogger(ReportController.class);

    @Autowired
    public ReportController(ProfileReportService profileReportService, ReportDataService reportDataService) {
        this.profileReportService = profileReportService;
        this.reportDataService = reportDataService;
    }

    @GetMapping("{initials}")
    public ResponseEntity<List<ReportData.ReportDataSlice>> getAllReportDataForConsultant(@PathVariable("initials") String initials) {
        LOG.info("getAllReportData: " + initials);
        List<ReportData> allReportDataForUser = reportDataService.getAllReportDataForUser(initials);
        List<ReportData.ReportDataSlice> reportDataSlices = allReportDataForUser.stream()
                .map(ReportData.ReportDataSlice::toReportDataSlice).collect(Collectors.toList());
        return ResponseEntity.ok(reportDataSlices);
    }

    @GetMapping(value = "/file/{reportId}", produces = "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    public ResponseEntity getReportFile(@PathVariable("reportId") Long reportId) {
        ReportData reportData = reportDataService.getReportDataById(reportId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + reportData.getInitials() + "_" + LocalDate.now() + ".docx")
                .body(new ByteArrayResource(reportData.getData()));
    }

    @DeleteMapping(value = "/delete/{reportId}")
    public ResponseEntity DeleteReportFile(@PathVariable("reportId") Long reportId) {
        reportDataService.deleteReportDataById(reportId);
        return ResponseEntity.ok("Deleted Report File");
    }

    @RequestMapping(method = RequestMethod.POST, consumes = "application/json", produces = "application/json")
    public ResponseEntity<String> generate(@RequestBody ReportInfo reportInfo,
                                           @RequestParam("type") String type) {
        LOG.info("Generating new report!");
        ReportData reportData = new ReportData(
                reportInfo.initials,
                reportInfo.viewProfile.getViewProfileInfo().getName(),
                reportInfo.initials + "_" + reportInfo.viewProfile.getViewProfileInfo().getName() + "_" + reportInfo.reportTemplate.getName(),
                reportInfo.reportTemplate.getId()
        );
        reportData = reportDataService.saveReportData(reportData);
        if ("DOC".equals(type)) {
            profileReportService.generateDocXExport(reportInfo, reportData.getId());
        } else {
            throw new RuntimeException("Unsupported type " + type);
        }
        return ResponseEntity.ok("Started Report Generation");
    }
}
