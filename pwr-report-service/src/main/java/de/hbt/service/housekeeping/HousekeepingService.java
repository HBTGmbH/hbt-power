package de.hbt.service.housekeeping;

import de.hbt.client.ConsultantNameClient;
import de.hbt.client.TemplateFileClient;
import de.hbt.data.ReportDataRepository;
import de.hbt.data.ReportDataRepository.ReportDataSummary;
import de.hbt.model.HousekeepingFindings;
import de.hbt.model.ReportStatus;
import de.hbt.repository.DBFileRepository;
import de.hbt.repository.DBFileRepository.FileSummary;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import javax.transaction.Transactional;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.function.Supplier;
import java.util.stream.Collectors;

/**
 * Housekeeping of the data of the report service (#242): documents about consultants that are gone, documents whose
 * rendering never finished, and template files no template points to. What it needs to know from other services it
 * asks them; it deletes only its own data. If another service does not answer, the check reports that instead of
 * findings, so an empty answer never turns every document into a left-over.
 */
@Service
@Transactional
public class HousekeepingService {

    public static final String REPORTS_WITHOUT_CONSULTANT = "reports-without-consultant";
    public static final String REPORTS_STUCK = "reports-stuck";
    public static final String FILES_WITHOUT_TEMPLATE = "files-without-template";

    /** A rendering takes seconds; one still running after this never finishes */
    static final Duration STUCK_AFTER = Duration.ofHours(1);

    private static final Logger LOG = LogManager.getLogger(HousekeepingService.class);

    private final ReportDataRepository reportDataRepository;
    private final DBFileRepository dbFileRepository;
    private final ConsultantNameClient consultantNameClient;
    private final TemplateFileClient templateFileClient;

    public HousekeepingService(ReportDataRepository reportDataRepository, DBFileRepository dbFileRepository,
                               ConsultantNameClient consultantNameClient, TemplateFileClient templateFileClient) {
        this.reportDataRepository = reportDataRepository;
        this.dbFileRepository = dbFileRepository;
        this.consultantNameClient = consultantNameClient;
        this.templateFileClient = templateFileClient;
    }

    public List<HousekeepingFindings> check() {
        return List.of(
                findings(REPORTS_WITHOUT_CONSULTANT, () -> reportsWithoutConsultant().stream()
                        .map(HousekeepingService::describe).collect(Collectors.toList())),
                findings(REPORTS_STUCK, () -> stuckReports().stream()
                        .map(HousekeepingService::describe).collect(Collectors.toList())),
                findings(FILES_WITHOUT_TEMPLATE, () -> filesWithoutTemplate().stream()
                        .map(file -> file.getFilename() + " (" + file.getId() + ")").collect(Collectors.toList()))
        );
    }

    /**
     * Deletes what the check finds right now; returns how many
     */
    public int clean(String check) {
        try {
            switch (check) {
                case REPORTS_WITHOUT_CONSULTANT:
                    return deleteReports(check, reportsWithoutConsultant());
                case REPORTS_STUCK:
                    return deleteReports(check, stuckReports());
                case FILES_WITHOUT_TEMPLATE:
                    List<String> files = filesWithoutTemplate().stream().map(FileSummary::getId).collect(Collectors.toList());
                    if (!files.isEmpty()) {
                        dbFileRepository.deleteAllByIdIn(files);
                    }
                    LOG.info("Housekeeping " + check + ": deleted files " + files);
                    return files.size();
                default:
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No housekeeping check " + check);
            }
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, unavailable(e));
        }
    }

    private static HousekeepingFindings findings(String check, Supplier<List<String>> findings) {
        try {
            return HousekeepingFindings.of(check, findings.get());
        } catch (RestClientException e) {
            return HousekeepingFindings.failed(check, unavailable(e));
        }
    }

    private static String unavailable(RestClientException e) {
        return "Another service did not answer: " + e.getMessage();
    }

    private int deleteReports(String check, List<ReportDataSummary> reports) {
        List<Long> ids = reports.stream().map(ReportDataSummary::getId).collect(Collectors.toList());
        if (!ids.isEmpty()) {
            reportDataRepository.deleteAllByIdIn(ids);
        }
        LOG.info("Housekeeping " + check + ": deleted reports " + ids);
        return ids.size();
    }

    private static String describe(ReportDataSummary report) {
        return report.getInitials() + ": " + report.getFileName()
                + (report.getCreatedAt() != null ? " (" + report.getCreatedAt().toString().substring(0, 10) + ")" : "");
    }

    private List<ReportDataSummary> reportsWithoutConsultant() {
        Set<String> initials = consultantNameClient.findAllInitials();
        if (initials.isEmpty()) {
            // Never all documents because of an empty answer
            throw new RestClientException("the profile service knows no consultant");
        }
        return reportDataRepository.findAllSummaries().stream()
                .filter(report -> !initials.contains(report.getInitials()))
                .collect(Collectors.toList());
    }

    /** Still running after an hour, or from before the start time was stored */
    private List<ReportDataSummary> stuckReports() {
        Instant before = Instant.now().minus(STUCK_AFTER);
        return reportDataRepository.findAllSummaries().stream()
                .filter(report -> report.getReportStatus() == ReportStatus.RUNNING)
                .filter(report -> report.getCreatedAt() == null || report.getCreatedAt().isBefore(before))
                .collect(Collectors.toList());
    }

    private List<FileSummary> filesWithoutTemplate() {
        Set<String> referenced = templateFileClient.findReferencedFileIds();
        return dbFileRepository.findAllSummaries().stream()
                .filter(file -> !referenced.contains(file.getId()))
                .collect(Collectors.toList());
    }
}
