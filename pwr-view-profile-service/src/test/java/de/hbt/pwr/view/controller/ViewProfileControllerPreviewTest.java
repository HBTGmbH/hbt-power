package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.client.report.ReportServiceClient;
import de.hbt.pwr.view.client.report.model.ReportInfo;
import de.hbt.pwr.view.exception.TemplateNotFoundException;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.service.ReportTemplateService;
import de.hbt.pwr.view.service.ViewProfileCreatorService;
import de.hbt.pwr.view.service.ViewProfileMergeService;
import de.hbt.pwr.view.service.ViewProfileOperationService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.HttpClientErrorException;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(ViewProfileController.class)
@ActiveProfiles("test")
public class ViewProfileControllerPreviewTest {

    private static final String URL = "/view/tst/view/vp1/t1/preview";
    private static final byte[] PDF = "%PDF-1.4 preview".getBytes(StandardCharsets.US_ASCII);

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ViewProfileOperationService viewProfileService;

    @MockBean
    private ReportServiceClient reportServiceClient;

    @MockBean
    private ReportTemplateService reportTemplateService;

    @MockBean
    private ViewProfileMergeService viewProfileMergeService;

    @MockBean
    private ViewProfileCreatorService viewProfileCreatorService;

    @SuppressWarnings("unused")
    @MockBean
    private RedisConnectionFactory redisConnectionFactory;

    private final ViewProfile viewProfile = new ViewProfile();
    private final ReportTemplate template = ReportTemplate.builder().id("t1").name("Standard").fileId("design").build();

    @Before
    public void setUp() {
        viewProfile.setId("vp1");
        viewProfile.getViewProfileInfo().setConsultantName("Erika Testerin");
        viewProfile.getViewProfileInfo().setConsultantBirthDate(LocalDate.of(1990, 1, 1));
        given(viewProfileService.getByIdAndCheckOwner("vp1", "tst")).willReturn(viewProfile);
        given(reportTemplateService.getTemplate("t1")).willReturn(template);
    }

    @Test
    public void rendersTheViewProfileWithTheTemplateAsPdf() throws Exception {
        given(reportServiceClient.renderPdfPreview(any())).willReturn(PDF);

        mockMvc.perform(get(URL))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(content().bytes(PDF));

        ArgumentCaptor<ReportInfo> reportInfo = ArgumentCaptor.forClass(ReportInfo.class);
        verify(reportServiceClient).renderPdfPreview(reportInfo.capture());
        assertThat(reportInfo.getValue().getInitials()).isEqualTo("tst");
        assertThat(reportInfo.getValue().getName()).isEqualTo("Erika Testerin");
        assertThat(reportInfo.getValue().getBirthDate()).isEqualTo(LocalDate.of(1990, 1, 1));
        assertThat(reportInfo.getValue().getViewProfile()).isSameAs(viewProfile);
        assertThat(reportInfo.getValue().getReportTemplate()).isSameAs(template);
        // Nothing is stored in the report history
        verify(reportServiceClient, never()).generateReport(any(), any());
    }

    @Test
    public void passesOnWhyTheTemplateCannotBeRendered() throws Exception {
        byte[] reason = "Rendering took longer than 60 s and was cancelled".getBytes(StandardCharsets.UTF_8);
        given(reportServiceClient.renderPdfPreview(any())).willThrow(HttpClientErrorException.create(
                HttpStatus.UNPROCESSABLE_ENTITY, "Unprocessable Entity", HttpHeaders.EMPTY, reason, StandardCharsets.UTF_8));

        mockMvc.perform(get(URL))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
                .andExpect(content().bytes(reason));
    }

    @Test
    public void unknownTemplateIsNotFound() throws Exception {
        given(reportTemplateService.getTemplate("t1")).willThrow(new TemplateNotFoundException("t1"));

        mockMvc.perform(get(URL)).andExpect(status().isNotFound());
        verify(reportServiceClient, never()).renderPdfPreview(any());
    }
}
