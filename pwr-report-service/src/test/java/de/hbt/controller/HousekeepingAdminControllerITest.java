package de.hbt.controller;

import de.hbt.client.ConsultantNameClient;
import de.hbt.client.ProfilePictureClient;
import de.hbt.client.TemplateFileClient;
import de.hbt.data.ReportDataRepository;
import de.hbt.model.ReportData;
import de.hbt.model.ReportStatus;
import de.hbt.model.files.DBFile;
import de.hbt.repository.DBFileRepository;
import de.hbt.service.TestConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.ResourceAccessException;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;

import static de.hbt.service.housekeeping.HousekeepingService.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Housekeeping of the report service (#242): it finds and deletes its own left-overs, asks the other services only
 * for what they know, and never treats a missing answer as "nothing there"
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Import(TestConfiguration.class)
class HousekeepingAdminControllerITest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ReportDataRepository reportDataRepository;
    @Autowired
    private DBFileRepository dbFileRepository;

    @MockBean
    private ConsultantNameClient consultantNameClient;
    @MockBean
    private TemplateFileClient templateFileClient;
    @MockBean
    private ProfilePictureClient profilePictureClient;

    @BeforeEach
    void setUp() {
        reportDataRepository.deleteAll();
        dbFileRepository.deleteAll();
        when(consultantNameClient.findAllInitials()).thenReturn(Set.of("kai", "eva"));
        when(templateFileClient.findReferencedFileIds()).thenReturn(Set.of());
    }

    private ReportData report(String initials, ReportStatus status, Instant createdAt) {
        ReportData report = new ReportData(initials, "Bewerbung", null, initials + ".docx", "template", initials, initials);
        report.setReportStatus(status);
        report.setCreatedAt(createdAt);
        return reportDataRepository.saveAndFlush(report);
    }

    private ReportData report(String initials) {
        return report(initials, ReportStatus.DONE, Instant.now());
    }

    private DBFile file(String name) {
        return dbFileRepository.saveAndFlush(new DBFile(name, "application/octet-stream", "x".getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void reportsAboutConsultantsThatAreGone_areFoundAndDeleted() throws Exception {
        report("kai");
        report("old");
        report("old");

        mockMvc.perform(get("/admin/housekeeping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].check").value(REPORTS_WITHOUT_CONSULTANT))
                .andExpect(jsonPath("$[0].count").value(2))
                .andExpect(jsonPath("$[0].examples[0]").value(startsWith("old: old.docx")))
                .andExpect(jsonPath("$[0].error").doesNotExist());

        mockMvc.perform(delete("/admin/housekeeping/" + REPORTS_WITHOUT_CONSULTANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2));
        assertThat(reportDataRepository.findAll()).extracting(ReportData::getInitials).containsExactly("kai");
    }

    @Test
    void withoutAnAnswerOfTheProfileService_theCheckFails_andNothingIsDeleted() throws Exception {
        report("old");
        when(consultantNameClient.findAllInitials()).thenThrow(new ResourceAccessException("Connection refused"));

        mockMvc.perform(get("/admin/housekeeping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].count").value(0))
                .andExpect(jsonPath("$[0].error").value(startsWith("Another service did not answer")))
                // The other checks run anyway
                .andExpect(jsonPath("$[1].error").doesNotExist());

        mockMvc.perform(delete("/admin/housekeeping/" + REPORTS_WITHOUT_CONSULTANT))
                .andExpect(status().isServiceUnavailable());
        assertThat(reportDataRepository.findAll()).hasSize(1);
    }

    @Test
    void anEmptyListOfConsultants_neverMakesEveryReportALeftOver() throws Exception {
        report("kai");
        when(consultantNameClient.findAllInitials()).thenReturn(Set.of());

        mockMvc.perform(get("/admin/housekeeping"))
                .andExpect(jsonPath("$[0].error").exists());
        mockMvc.perform(delete("/admin/housekeeping/" + REPORTS_WITHOUT_CONSULTANT))
                .andExpect(status().isServiceUnavailable());
        assertThat(reportDataRepository.findAll()).hasSize(1);
    }

    @Test
    void reportsStillRunningAfterAnHour_areFoundAndDeleted() throws Exception {
        Instant twoHoursAgo = Instant.now().minus(Duration.ofHours(2));
        report("kai", ReportStatus.RUNNING, twoHoursAgo);
        report("kai", ReportStatus.RUNNING, null);
        ReportData running = report("kai", ReportStatus.RUNNING, Instant.now());
        ReportData done = report("eva", ReportStatus.DONE, twoHoursAgo);

        mockMvc.perform(get("/admin/housekeeping"))
                .andExpect(jsonPath("$[1].check").value(REPORTS_STUCK))
                .andExpect(jsonPath("$[1].count").value(2));

        mockMvc.perform(delete("/admin/housekeeping/" + REPORTS_STUCK))
                .andExpect(jsonPath("$.count").value(2));
        assertThat(reportDataRepository.findAll()).extracting(ReportData::getId)
                .containsExactlyInAnyOrder(running.getId(), done.getId());
    }

    @Test
    void filesNoTemplatePointsTo_areFoundAndDeleted() throws Exception {
        DBFile design = file("design.rptdesign");
        DBFile preview = file("preview.png");
        file("orphan.rptdesign");
        when(templateFileClient.findReferencedFileIds()).thenReturn(Set.of(design.getId(), preview.getId()));

        mockMvc.perform(get("/admin/housekeeping"))
                .andExpect(jsonPath("$[2].check").value(FILES_WITHOUT_TEMPLATE))
                .andExpect(jsonPath("$[2].count").value(1))
                .andExpect(jsonPath("$[2].examples[0]").value(startsWith("orphan.rptdesign (")));

        mockMvc.perform(delete("/admin/housekeeping/" + FILES_WITHOUT_TEMPLATE))
                .andExpect(jsonPath("$.count").value(1));
        assertThat(dbFileRepository.findAll()).extracting(DBFile::getId).containsExactlyInAnyOrder(design.getId(), preview.getId());
    }

    @Test
    void withoutAnAnswerOfTheViewProfileService_noFileIsDeleted() throws Exception {
        file("design.rptdesign");
        when(templateFileClient.findReferencedFileIds()).thenThrow(new ResourceAccessException("Connection refused"));

        mockMvc.perform(get("/admin/housekeeping"))
                .andExpect(jsonPath("$[2].error").exists())
                .andExpect(jsonPath("$[0].error").doesNotExist());
        mockMvc.perform(delete("/admin/housekeeping/" + FILES_WITHOUT_TEMPLATE))
                .andExpect(status().isServiceUnavailable());
        assertThat(dbFileRepository.findAll()).hasSize(1);
    }

    @Test
    void anUnknownCheck_isNotFound_andNothingIsOutsideAdmin() throws Exception {
        mockMvc.perform(delete("/admin/housekeeping/unknown")).andExpect(status().isNotFound());
        mockMvc.perform(get("/housekeeping")).andExpect(status().isNotFound());
    }
}
