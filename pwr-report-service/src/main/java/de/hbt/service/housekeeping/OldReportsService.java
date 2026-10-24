package de.hbt.service.housekeeping;

import de.hbt.data.ReportDataRepository;
import de.hbt.data.ReportDataRepository.ReportDataSummary;
import de.hbt.model.HousekeepingFindings;
import de.hbt.model.ReportStatus;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.transaction.Transactional;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Housekeeping, rubric <em>old</em> (#289): exported documents nobody probably needs any more, older than
 * {@code pwr.housekeeping.old-reports-after}. They are no left-overs, so deleting them is a decision of the admin. The
 * newest document of every consultant always stays, however old; the consultant is not asked.
 */
@Service
@Transactional
public class OldReportsService {

    public static final String OLD_REPORTS = "old-reports";

    private static final Logger LOG = LogManager.getLogger(OldReportsService.class);

    private final ReportDataRepository reportDataRepository;
    private final Duration oldAfter;

    public OldReportsService(ReportDataRepository reportDataRepository,
                             @Value("${pwr.housekeeping.old-reports-after:730d}") Duration oldAfter) {
        this.reportDataRepository = reportDataRepository;
        this.oldAfter = oldAfter;
    }

    public List<HousekeepingFindings> check() {
        List<ReportDataSummary> old = oldReports();
        HousekeepingFindings findings = HousekeepingFindings.of(OLD_REPORTS, old.stream()
                .map(OldReportsService::describe).collect(Collectors.toList()));
        findings.setBytes(old.isEmpty() ? 0L : reportDataRepository.sumSizeByIdIn(ids(old)));
        return List.of(findings);
    }

    /**
     * Deletes what the check finds right now; returns how many
     */
    public int clean(String check) {
        if (!OLD_REPORTS.equals(check)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No housekeeping check " + check);
        }
        List<Long> ids = ids(oldReports());
        if (!ids.isEmpty()) {
            reportDataRepository.deleteAllByIdIn(ids);
        }
        LOG.info("Housekeeping " + check + ": deleted reports " + ids);
        return ids.size();
    }

    private static List<Long> ids(List<ReportDataSummary> reports) {
        return reports.stream().map(ReportDataSummary::getId).collect(Collectors.toList());
    }

    /**
     * Finished or failed before the limit, except the newest of each consultant. One still rendering is a matter of
     * the stuck check and doesn't count as the newest: it may still fail.
     */
    private List<ReportDataSummary> oldReports() {
        LocalDate limit = LocalDate.now().minusDays(oldAfter.toDays());
        Map<String, List<ReportDataSummary>> byConsultant = reportDataRepository.findAllSummaries().stream()
                .filter(report -> day(report) != null)
                .filter(report -> report.getReportStatus() != ReportStatus.RUNNING)
                .collect(Collectors.groupingBy(report -> String.valueOf(report.getInitials()).toLowerCase(Locale.ROOT)));
        return byConsultant.values().stream()
                .flatMap(reports -> reports.stream()
                        .sorted(Comparator.comparing(OldReportsService::day).thenComparing(ReportDataSummary::getId).reversed())
                        .skip(1))
                .filter(report -> day(report).isBefore(limit))
                .sorted(Comparator.comparing(OldReportsService::day).thenComparing(ReportDataSummary::getId))
                .collect(Collectors.toList());
    }

    private static LocalDate day(ReportDataSummary report) {
        return report.getCreatedAt() != null ? LocalDate.ofInstant(report.getCreatedAt(), ZoneId.systemDefault())
                : report.getCreateDate();
    }

    private static String describe(ReportDataSummary report) {
        return report.getInitials() + ": "
                + (report.getViewProfileName() != null && !report.getViewProfileName().isBlank()
                ? report.getViewProfileName() : report.getFileName())
                + " (" + day(report) + ")";
    }
}
