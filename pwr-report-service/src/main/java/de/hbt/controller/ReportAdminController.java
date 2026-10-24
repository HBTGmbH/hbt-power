package de.hbt.controller;

import de.hbt.service.ReportDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The exported documents of a consultant as a whole. Only the profile service calls this, while an admin deletes the
 * consultant; the edge lets only admins through to {@code /admin} (#240).
 */
@RestController
@RequestMapping("admin/report")
public class ReportAdminController {

    private static final Logger LOG = LoggerFactory.getLogger(ReportAdminController.class);

    private final ReportDataService reportDataService;

    public ReportAdminController(ReportDataService reportDataService) {
        this.reportDataService = reportDataService;
    }

    /**
     * Deletes every document about the consultant with these initials; none is no error, so it can be repeated
     */
    @DeleteMapping("{initials}")
    public ResponseEntity<Void> deleteAllReportsOfConsultant(@PathVariable("initials") String initials) {
        long deleted = reportDataService.deleteAllReportDataForUser(initials);
        LOG.info("Deleted " + deleted + " reports of " + initials);
        return ResponseEntity.noContent().build();
    }
}
