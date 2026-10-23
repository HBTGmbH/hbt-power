package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.client.report.ReportServiceClient;
import de.hbt.pwr.view.client.report.model.ReportInfo;
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
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(ViewProfileController.class)
@ActiveProfiles("test")
/**
 * Exporting passes on who is logged in, from the headers of the edge only (#214)
 */
public class ViewProfileControllerReportTest {

    private static final String URL = "/view/tst/view/vp1/t1/report";

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
        given(reportServiceClient.generateReport(any(), any(), any(), any())).willReturn(ResponseEntity.ok("Started"));
    }

    @Test
    public void passesOnWhoIsLoggedInFromTheHeaders() throws Exception {
        mockMvc.perform(post(URL)
                .header(ViewProfileController.USER_LOGIN_HEADER, "ada.admin@example.com")
                .header(ViewProfileController.USER_INITIALS_HEADER, "adm"))
                .andExpect(status().isCreated());

        ArgumentCaptor<ReportInfo> reportInfo = ArgumentCaptor.forClass(ReportInfo.class);
        verify(reportServiceClient).generateReport(reportInfo.capture(), eq("DOC"), eq("ada.admin@example.com"), eq("adm"));
        // The profile of the export is still the one in the path
        assertThat(reportInfo.getValue().getInitials()).isEqualTo("tst");
        assertThat(reportInfo.getValue().getViewProfile()).isSameAs(viewProfile);
    }

    @Test
    public void withoutTheHeadersNobodyIsPassedOn() throws Exception {
        mockMvc.perform(post(URL)).andExpect(status().isCreated());

        verify(reportServiceClient).generateReport(any(), eq("DOC"), isNull(), isNull());
    }
}
