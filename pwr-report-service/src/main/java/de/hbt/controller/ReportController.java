package de.hbt.controller;

import de.hbt.model.ReportData;
import de.hbt.model.ReportFileRef;
import de.hbt.model.ReportInfo;
import de.hbt.model.export.Profil;
import de.hbt.service.ModelConvertService;
import de.hbt.service.ProfileReportService;
import de.hbt.service.ReportDataService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping(value = "/report")
public class ReportController {

    private final ProfileReportService profileReportService;
    private final ModelConvertService ModelConvertService;
    private final ReportDataService reportDataService;

    private static final Logger LOG = LogManager.getLogger(ReportController.class);

    @Value("${export.kurztextCharsPerLine}")
    private int kurztextCharsPerLine;

    @Value("${export.lang}")
    private String language;

    private final HttpServletRequest request;

    @Autowired
    public ReportController(ProfileReportService profileReportService, ModelConvertService modelConvertService, ReportDataService reportDataService, HttpServletRequest request) {
        this.profileReportService = profileReportService;
        this.ModelConvertService = modelConvertService;
        this.reportDataService = reportDataService;
        this.request = request;
    }

    @RequestMapping(method = RequestMethod.GET, value = "/refs/{initials}")
    public ResponseEntity<List<ReportFileRef>> getAllRefs(@PathVariable("initials") String initials) {
        LOG.info("getAllRefs: " + initials);
        return ResponseEntity.ok(profileReportService.getAllRefs(initials));
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
        LOG.info("getReportFile: " + reportId);
        ReportData reportData = reportDataService.getReportDataById(reportId);
        return ResponseEntity.ok()
                .body(new ByteArrayResource(reportData.getData()));
    }

    @DeleteMapping(value = "/delete/{reportId}")
    public ResponseEntity DeleteReportFile(@PathVariable("reportId") Long reportId) {
        LOG.info("deleteReportFile: " + reportId);
        reportDataService.deleteReportDataById(reportId);
        return ResponseEntity.ok("Deleted Report File");
    }

    @RequestMapping(method = RequestMethod.POST, consumes = "application/json", produces = "application/json")
    public ResponseEntity<String> generate(@RequestBody ReportInfo reportInfo,
                                           @RequestParam("type") String type,
                                           @RequestParam(value = "charsperline", required = false) String charsPerLine) throws Exception {
        File xmlFile = null;
        LOG.info("Generating new report!");
        ReportData reportData = new ReportData(
                reportInfo.initials,
                reportInfo.viewProfile.getViewProfileInfo().getName(),
                reportInfo.initials + "_" + reportInfo.viewProfile.getViewProfileInfo().getName() + "_" + reportInfo.reportTemplate.getName(),
                reportInfo.reportTemplate.getId()
        );

        reportData = reportDataService.saveReportData(reportData);

        if (charsPerLine != null) {
            kurztextCharsPerLine = Integer.parseInt(charsPerLine);
        }
        try {
            Profil profile = ModelConvertService.convert(reportInfo);
            xmlFile = profileReportService.marshalToXML(profile);
            LOG.info("xml fileId: " + xmlFile.getAbsolutePath());
            if ("DOC".equals(type)) {
                //Async Call
                profileReportService.generateDocXExport(xmlFile, reportInfo, reportData.getId());
            } else {
                throw new RuntimeException("Unsupported type " + type);
            }
            return ResponseEntity.ok("Started Report Generation");
        } finally {
            if (xmlFile != null) {
                xmlFile.delete();
            }
        }
    }
}
