package de.hbt.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.hbt.client.ProfilePictureClient;
import de.hbt.config.ReportServiceConfig;
import de.hbt.data.ReportDataRepository;
import de.hbt.exceptions.ReportRenderException;
import de.hbt.model.ReportInfo;
import de.hbt.model.ReportTemplate;
import de.hbt.model.files.DBFile;
import de.hbt.model.view.ViewProfile;
import de.hbt.repository.DBFileRepository;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.HttpClientErrorException;

import javax.transaction.Transactional;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Live preview of a report: rendered as PDF with the data of a view profile, only in memory.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Import(TestConfiguration.class)
class PreviewRenderingITest {

    @Autowired
    private ProfileReportService profileReportService;

    @Autowired
    private DBFileRepository dbFileRepository;

    @Autowired
    private ReportDataRepository reportDataRepository;

    @Autowired
    private ReportServiceConfig reportServiceConfig;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProfilePictureClient profilePictureClient;

    @BeforeEach
    void noProfilePicture() {
        when(profilePictureClient.getPictureByInitials("tst"))
                .thenThrow(HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found", HttpHeaders.EMPTY, null, null));
    }

    @SneakyThrows
    private static byte[] standardTemplate() {
        return new ClassPathResource("templates/designfile_hbt_standard.rptdesign").getInputStream().readAllBytes();
    }

    private ReportInfo reportInfo(byte[] design) {
        DBFile file = dbFileRepository.saveAndFlush(new DBFile("design.rptdesign", "application/octet-stream", design));
        ReportInfo reportInfo = new ReportInfo();
        reportInfo.initials = "tst";
        reportInfo.name = "Erika Testerin";
        reportInfo.reportTemplate = new ReportTemplate("Standard", "", file.getId(), "");
        reportInfo.viewProfile = new ViewProfile().toBuilder()
                .id("1234")
                .viewDescription("Beispiel")
                .ownerInitials("tst")
                .build();
        // Where the view-profile service sends the owner (#262)
        reportInfo.viewProfile.getViewProfileInfo().setOwnerInitials("tst");
        return reportInfo;
    }

    private static void assertIsPdf(byte[] pdf) {
        assertThat(pdf).hasSizeGreaterThan(1000);
        assertThat(new String(Arrays.copyOf(pdf, 5), StandardCharsets.US_ASCII)).isEqualTo("%PDF-");
    }

    @Test
    @Transactional
    void shouldRenderPdfOfStandardTemplateWithoutStoringAnything() {
        ReportInfo reportInfo = reportInfo(standardTemplate());
        long files = dbFileRepository.count();
        long reports = reportDataRepository.count();

        byte[] pdf = profileReportService.renderPdfPreview(reportInfo);

        assertIsPdf(pdf);
        assertThat(dbFileRepository.count()).isEqualTo(files);
        assertThat(reportDataRepository.count()).isEqualTo(reports);
    }

    @Test
    @Transactional
    @SneakyThrows
    void previewEndpointReturnsPdfThatIsNotCached() {
        ReportInfo reportInfo = reportInfo(standardTemplate());

        byte[] pdf = mockMvc.perform(post("/report/preview")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(reportInfo)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andReturn().getResponse().getContentAsByteArray();

        assertIsPdf(pdf);
    }

    @Test
    @Transactional
    @SneakyThrows
    void previewEndpointExplainsWhyATemplateCannotBeRendered() {
        ReportInfo reportInfo = reportInfo("no design".getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(post("/report/preview")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(reportInfo)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("could not be opened")));
    }

    /**
     * Before #65 the cover of the standard template was 9.32in high, more than the body of an A4 page: BIRT then
     * added pages forever (PDF)
     */
    @Test
    @Transactional
    @SneakyThrows
    void shouldCancelRenderingOfDesignHigherThanThePage() {
        String design = new String(standardTemplate(), StandardCharsets.UTF_8);
        byte[] tooHigh = design.replace("<property name=\"height\">9.1in</property>", "<property name=\"height\">9.32in</property>")
                .getBytes(StandardCharsets.UTF_8);
        ReportInfo reportInfo = reportInfo(tooHigh);
        long configuredTimeLimit = reportServiceConfig.getPreviewTimeLimitSeconds();
        reportServiceConfig.setPreviewTimeLimitSeconds(5);
        try {
            assertThatThrownBy(() -> profileReportService.renderPdfPreview(reportInfo))
                    .isInstanceOf(ReportRenderException.class)
                    .hasMessageContaining("cancelled");
            // cancel() has to end BIRT's loop, not only the wait for it
            Thread.sleep(2000);
            assertThat(Thread.getAllStackTraces().keySet()).noneMatch(thread -> thread.getName().equals("birt-render"));
        } finally {
            reportServiceConfig.setPreviewTimeLimitSeconds(configuredTimeLimit);
        }
    }
}
