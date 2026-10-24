package de.hbt.controller;

import de.hbt.client.ConsultantNameClient;
import de.hbt.client.ProfilePictureClient;
import de.hbt.client.TemplateFileClient;
import de.hbt.data.ReportDataRepository;
import de.hbt.model.ReportData;
import de.hbt.model.ReportStatus;
import de.hbt.service.TestConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;

import static de.hbt.service.housekeeping.OldReportsService.OLD_REPORTS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Housekeeping, rubric old (#289): documents older than the limit (730 days by default), the newest of each
 * consultant excepted
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Import(TestConfiguration.class)
class OldReportsITest {

    private static final Instant THREE_YEARS_AGO = Instant.now().minus(Duration.ofDays(3 * 365));

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ReportDataRepository reportDataRepository;

    @MockBean
    private ConsultantNameClient consultantNameClient;
    @MockBean
    private TemplateFileClient templateFileClient;
    @MockBean
    private ProfilePictureClient profilePictureClient;

    @BeforeEach
    void setUp() {
        reportDataRepository.deleteAll();
    }

    private ReportData report(String initials, String viewProfile, ReportStatus status, Instant createdAt, int bytes) {
        ReportData report = new ReportData(initials, viewProfile, null, initials + ".docx", "template", initials, initials);
        report.setReportStatus(status);
        report.setCreatedAt(createdAt);
        report.setData(new byte[bytes]);
        return reportDataRepository.saveAndFlush(report);
    }

    @Test
    void oldDocuments_areFoundAndDeleted_theNewestOfEachConsultantStays() throws Exception {
        // kai: two old ones and a recent one; eva: only old ones; ole: one old one, his newest
        report("kai", "Alt 1", ReportStatus.DONE, THREE_YEARS_AGO, 100);
        report("kai", "Alt 2", ReportStatus.ERROR, THREE_YEARS_AGO.plus(Duration.ofDays(1)), 200);
        report("kai", "Neu", ReportStatus.DONE, Instant.now(), 300);
        report("eva", "Eva alt", ReportStatus.DONE, THREE_YEARS_AGO, 400);
        report("eva", "Eva jüngstes", ReportStatus.DONE, THREE_YEARS_AGO.plus(Duration.ofDays(30)), 500);
        report("ole", "Ole einziges", ReportStatus.DONE, THREE_YEARS_AGO, 600);

        mockMvc.perform(get("/admin/housekeeping/old"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].check").value(OLD_REPORTS))
                .andExpect(jsonPath("$[0].count").value(3))
                .andExpect(jsonPath("$[0].bytes").value(100 + 200 + 400))
                .andExpect(jsonPath("$[0].examples[0]").value("kai: Alt 1 (" + LocalDate.now().minusDays(3 * 365) + ")"));

        mockMvc.perform(delete("/admin/housekeeping/old/" + OLD_REPORTS))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(3));
        assertThat(reportDataRepository.findAll()).extracting(ReportData::getViewProfileName)
                .containsExactlyInAnyOrder("Neu", "Eva jüngstes", "Ole einziges");
    }

    @Test
    void aDocumentStillRendering_isNeverOld_andNotTheNewest() throws Exception {
        report("kai", "Alt", ReportStatus.DONE, THREE_YEARS_AGO, 10);
        report("kai", "Läuft", ReportStatus.RUNNING, THREE_YEARS_AGO.plus(Duration.ofDays(1)), 10);

        // The old one is kai's newest finished document, the running one may still fail
        mockMvc.perform(get("/admin/housekeeping/old"))
                .andExpect(jsonPath("$[0].count").value(0))
                .andExpect(jsonPath("$[0].bytes").value(0));
    }

    @Test
    void documentsFromBeforeTheTimestamp_countByTheirDay() throws Exception {
        ReportData older = report("kai", "Ohne Zeitstempel", ReportStatus.DONE, null, 10);
        older.setCreateDate(LocalDate.now().minusYears(5));
        reportDataRepository.saveAndFlush(older);
        report("kai", "Neu", ReportStatus.DONE, Instant.now(), 10);

        mockMvc.perform(get("/admin/housekeeping/old"))
                .andExpect(jsonPath("$[0].examples", contains("kai: Ohne Zeitstempel (" + LocalDate.now().minusYears(5) + ")")));
    }

    @Test
    void anUnknownCheck_isNotFound_andOnlyAdminsGetThere() throws Exception {
        mockMvc.perform(delete("/admin/housekeeping/old/everything"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/admin/housekeeping/old").header("X-Pwr-User-Admin", "false"))
                .andExpect(status().isForbidden());
    }
}
