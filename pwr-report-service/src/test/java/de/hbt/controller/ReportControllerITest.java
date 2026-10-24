package de.hbt.controller;

import de.hbt.client.ConsultantNameClient;
import de.hbt.client.ProfilePictureClient;
import de.hbt.data.ReportDataRepository;
import de.hbt.model.ReportData;
import de.hbt.service.ProfileReportService;
import de.hbt.service.TestConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.web.firewall.RequestRejectedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.net.URI;
import java.util.List;
import java.util.Optional;

import static de.hbt.security.ConsultantAccess.USER_ADMIN_HEADER;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The report history keeps the description of the view profile and who exported (#214); who exported comes only from
 * the headers of the edge
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Import(TestConfiguration.class)
class ReportControllerITest {

    private static final String REPORT_INFO = "{"
            + "\"initials\": \"tst\","
            + "\"viewProfile\": {\"viewProfileInfo\": {\"name\": \"Anfrage A\", \"viewDescription\": \"Für Kunde X\"}},"
            + "\"reportTemplate\": {\"id\": \"template-1\", \"name\": \"Standard\"},"
            // Not taken over: who exports is no part of the body
            + "\"exportedByInitials\": \"fake\", \"exportedByName\": \"Jemand Anderes\""
            + "}";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ReportDataRepository reportDataRepository;

    @MockBean
    private ProfileReportService profileReportService;

    @MockBean
    private ConsultantNameClient consultantNameClient;

    @MockBean
    private ProfilePictureClient profilePictureClient;

    @BeforeEach
    void clear() {
        reportDataRepository.deleteAll();
    }

    private MockHttpServletRequestBuilder generate() {
        return post("/report").param("type", "DOC").contentType(MediaType.APPLICATION_JSON).content(REPORT_INFO);
    }

    private ReportData theOnlyReport() {
        List<ReportData> reports = reportDataRepository.findAll();
        assertThat(reports).hasSize(1);
        return reports.get(0);
    }

    @Test
    void storesDescriptionAndWhoExportedFromTheHeaders() throws Exception {
        when(consultantNameClient.findFullName("adm")).thenReturn(Optional.of("Ada Admin"));

        mockMvc.perform(generate().header(ReportController.USER_INITIALS_HEADER, "adm")
                .header(ReportController.USER_LOGIN_HEADER, "ada.admin@example.com"))
                .andExpect(status().isOk());

        ReportData report = theOnlyReport();
        assertThat(report.getViewProfileDescription()).isEqualTo("Für Kunde X");
        assertThat(report.getExportedByInitials()).isEqualTo("adm");
        assertThat(report.getExportedByName()).isEqualTo("Ada Admin");
    }

    @Test
    void historyContainsTheNewFields() throws Exception {
        when(consultantNameClient.findFullName("adm")).thenReturn(Optional.of("Ada Admin"));
        mockMvc.perform(generate().header(ReportController.USER_INITIALS_HEADER, "adm")).andExpect(status().isOk());

        mockMvc.perform(get("/report/tst"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].viewProfileName").value("Anfrage A"))
                .andExpect(jsonPath("$[0].viewProfileDescription").value("Für Kunde X"))
                .andExpect(jsonPath("$[0].exportedByInitials").value("adm"))
                .andExpect(jsonPath("$[0].exportedByName").value("Ada Admin"));
    }

    @Test
    void withoutAConsultantTheLoginIsTheName() throws Exception {
        when(consultantNameClient.findFullName("ext")).thenReturn(Optional.empty());

        mockMvc.perform(generate().header(ReportController.USER_INITIALS_HEADER, "ext")
                .header(ReportController.USER_LOGIN_HEADER, "extern@example.com"))
                .andExpect(status().isOk());

        assertThat(theOnlyReport().getExportedByName()).isEqualTo("extern@example.com");
    }

    @Test
    void withoutTheHeadersNobodyExported() throws Exception {
        mockMvc.perform(generate()).andExpect(status().isOk());

        ReportData report = theOnlyReport();
        assertThat(report.getExportedByInitials()).isNull();
        assertThat(report.getExportedByName()).isNull();
        assertThat(report.getViewProfileDescription()).isEqualTo("Für Kunde X");
        verify(consultantNameClient, never()).findFullName(anyString());
    }

    @Test
    void aLongDescriptionIsShortenedToTheColumn() throws Exception {
        String longDescription = "x".repeat(ReportController.MAX_DESCRIPTION_LENGTH + 10);
        mockMvc.perform(post("/report").param("type", "DOC").contentType(MediaType.APPLICATION_JSON)
                .content(REPORT_INFO.replace("Für Kunde X", longDescription)))
                .andExpect(status().isOk());

        assertThat(theOnlyReport().getViewProfileDescription()).hasSize(ReportController.MAX_DESCRIPTION_LENGTH);
    }

    // ------------------------------------------------------------------------------- own documents only (#255)

    private ReportData storedReport(String initials) {
        ReportData report = new ReportData(initials, "Anfrage A", null, initials + "_Anfrage A_Standard",
                "template-1", null, null);
        report.setData(new byte[]{1, 2, 3});
        return reportDataRepository.save(report);
    }

    private static MockHttpServletRequestBuilder asUser(MockHttpServletRequestBuilder request, String initials) {
        return request.header(USER_ADMIN_HEADER, "false").header(ReportController.USER_INITIALS_HEADER, initials);
    }

    @Test
    void userSeesAndChangesOnlyTheOwnDocuments() throws Exception {
        ReportData own = storedReport("tst");
        ReportData other = storedReport("xyz");

        mockMvc.perform(asUser(get("/report/tst"), "TST")).andExpect(status().isOk());
        mockMvc.perform(asUser(get("/report/file/" + own.getId()), "tst")).andExpect(status().isOk());
        mockMvc.perform(asUser(get("/report/xyz"), "tst")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(get("/report/file/" + other.getId()), "tst")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(delete("/report/delete/" + other.getId()), "tst")).andExpect(status().isForbidden());
        assertThat(reportDataRepository.findById(other.getId())).isPresent();

        mockMvc.perform(asUser(delete("/report/delete/" + own.getId()), "tst")).andExpect(status().isOk());
        assertThat(reportDataRepository.findById(own.getId())).isEmpty();
    }

    @Test
    void userExportsAndPreviewsOnlyTheOwnProfile() throws Exception {
        mockMvc.perform(asUser(generate(), "xyz")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(post("/report/preview"), "xyz")
                        .contentType(MediaType.APPLICATION_JSON).content(REPORT_INFO))
                .andExpect(status().isForbidden());
        assertThat(reportDataRepository.findAll()).isEmpty();

        mockMvc.perform(asUser(post("/report/preview"), "tst")
                        .contentType(MediaType.APPLICATION_JSON).content(REPORT_INFO))
                .andExpect(status().isOk());
    }

    @Test
    void adminSeesAndChangesTheDocumentsOfEveryone() throws Exception {
        ReportData other = storedReport("xyz");

        mockMvc.perform(get("/report/file/" + other.getId()).header(USER_ADMIN_HEADER, "true"))
                .andExpect(status().isOk());
        mockMvc.perform(generate().header(USER_ADMIN_HEADER, "true")).andExpect(status().isOk());
        mockMvc.perform(delete("/report/delete/" + other.getId()).header(USER_ADMIN_HEADER, "true"))
                .andExpect(status().isOk());
    }

    /**
     * The service lets only admins reach /admin itself, however the path is written (#260)
     */
    @Test
    void onlyAnAdminReachesTheAdminEndpoints() throws Exception {
        mockMvc.perform(get("/admin/file").header(USER_ADMIN_HEADER, "false")).andExpect(status().isForbidden());
        // The firewall of Spring Security in this service rejects a ';' before anything else
        assertThatThrownBy(() -> mockMvc.perform(get("/admin;x/file").header(USER_ADMIN_HEADER, "false")))
                .isInstanceOf(RequestRejectedException.class);
        mockMvc.perform(get(URI.create("/%61dmin/file")).header(USER_ADMIN_HEADER, "false"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/admin/file").header(USER_ADMIN_HEADER, "true")).andExpect(status().isOk());
        mockMvc.perform(get("/admin/file")).andExpect(status().isOk());
    }
}
