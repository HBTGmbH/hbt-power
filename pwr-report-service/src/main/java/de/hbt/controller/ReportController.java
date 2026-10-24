package de.hbt.controller;

import de.hbt.client.ConsultantNameClient;
import de.hbt.exceptions.ReportRenderException;
import de.hbt.model.ReportData;
import de.hbt.model.ReportInfo;
import de.hbt.model.view.ViewProfileInfo;
import de.hbt.security.ConsultantAccess;
import de.hbt.service.ProfileReportService;
import de.hbt.service.ReportDataService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

    private final ConsultantNameClient consultantNameClient;

    /**
     * Who is logged in, set by the edge from the verified token; the view-profile service passes them on
     */
    static final String USER_LOGIN_HEADER = "X-Pwr-User-Login";
    static final String USER_INITIALS_HEADER = "X-Pwr-User-Initials";

    /**
     * Length of the column {@code view_profile_description}
     */
    static final int MAX_DESCRIPTION_LENGTH = 4000;

    private static final Logger LOG = LogManager.getLogger(ReportController.class);

    @Autowired
    public ReportController(ProfileReportService profileReportService, ReportDataService reportDataService,
                            ConsultantNameClient consultantNameClient) {
        this.profileReportService = profileReportService;
        this.reportDataService = reportDataService;
        this.consultantNameClient = consultantNameClient;
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
    public ResponseEntity<ByteArrayResource> getReportFile(@PathVariable("reportId") Long reportId) {
        ReportData reportData = reportDataService.getReportDataById(reportId);
        ConsultantAccess.check(reportData.getInitials());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + reportData.getInitials() + "_" + LocalDate.now() + ".docx")
                .body(new ByteArrayResource(reportData.getData()));
    }

    @DeleteMapping(value = "/delete/{reportId}")
    public ResponseEntity<String> deleteReportFile(@PathVariable("reportId") Long reportId) {
        ConsultantAccess.check(reportDataService.getReportDataById(reportId).getInitials());
        reportDataService.deleteReportDataById(reportId);
        return ResponseEntity.ok("Deleted Report File");
    }

    @RequestMapping(method = RequestMethod.POST, consumes = "application/json", produces = "application/json")
    public ResponseEntity<String> generate(@RequestBody ReportInfo reportInfo,
                                           @RequestParam("type") String type,
                                           @RequestHeader(value = USER_LOGIN_HEADER, required = false) String login,
                                           @RequestHeader(value = USER_INITIALS_HEADER, required = false) String exportedBy) {
        LOG.info("Generating new report!");
        ConsultantAccess.check(reportInfo.initials);
        ViewProfileInfo viewProfileInfo = reportInfo.viewProfile.getViewProfileInfo();
        // Who exports only from the headers of the edge (#214), the name as it is now; without them (locally) nobody
        String exportedByName = null;
        if (exportedBy != null && !exportedBy.isBlank()) {
            exportedByName = consultantNameClient.findFullName(exportedBy).orElse(login);
        }
        ReportData reportData = new ReportData(
                reportInfo.initials,
                viewProfileInfo.getName(),
                truncate(viewProfileInfo.getViewDescription()),
                reportInfo.initials + "_" + viewProfileInfo.getName() + "_" + reportInfo.reportTemplate.getName(),
                reportInfo.reportTemplate.getId(),
                exportedBy,
                exportedByName
        );
        reportData = reportDataService.saveReportData(reportData);
        if ("DOC".equals(type)) {
            profileReportService.generateDocXExport(reportInfo, reportData.getId());
        } else {
            throw new RuntimeException("Unsupported type " + type);
        }
        return ResponseEntity.ok("Started Report Generation");
    }

    private static String truncate(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.length() > MAX_DESCRIPTION_LENGTH ? description.substring(0, MAX_DESCRIPTION_LENGTH) : description;
    }

    /**
     * The report as PDF, rendered live and only in memory: no entry in the report history, nothing stored.
     */
    @PostMapping(value = "/preview", consumes = "application/json")
    public ResponseEntity<byte[]> preview(@RequestBody ReportInfo reportInfo) {
        LOG.info("Rendering preview for " + reportInfo.initials);
        ConsultantAccess.check(reportInfo.initials);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .cacheControl(CacheControl.noStore())
                .body(profileReportService.renderPdfPreview(reportInfo));
    }

    /**
     * The template cannot be rendered with this data (e.g. an element higher than the page)
     */
    @ExceptionHandler(ReportRenderException.class)
    public ResponseEntity<String> renderingFailed(ReportRenderException e) {
        LOG.warn("Rendering failed", e);
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .contentType(MediaType.TEXT_PLAIN)
                .body(e.getMessage());
    }
}
