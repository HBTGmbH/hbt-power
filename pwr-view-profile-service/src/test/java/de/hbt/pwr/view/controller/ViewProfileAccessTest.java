package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.client.report.ReportServiceClient;
import de.hbt.pwr.view.service.ReportTemplateService;
import de.hbt.pwr.view.service.ViewProfileCreatorService;
import de.hbt.pwr.view.service.ViewProfileMergeService;
import de.hbt.pwr.view.service.ViewProfileOperationService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static de.hbt.pwr.view.security.ConsultantAccess.USER_ADMIN_HEADER;
import static de.hbt.pwr.view.security.ConsultantAccess.USER_INITIALS_HEADER;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * A user reads and changes only the own view profiles, an admin everyone's (#255)
 */
@RunWith(SpringRunner.class)
@WebMvcTest(ViewProfileController.class)
@ActiveProfiles("test")
public class ViewProfileAccessTest {

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

    private static MockHttpServletRequestBuilder asUser(MockHttpServletRequestBuilder request, String initials) {
        return request.header(USER_ADMIN_HEADER, "false").header(USER_INITIALS_HEADER, initials);
    }

    @Test
    public void userReadsTheOwnViewProfiles() throws Exception {
        mockMvc.perform(asUser(get("/view/TST"), "tst")).andExpect(status().isOk());
    }

    @Test
    public void userNeitherReadsNorChangesTheViewProfilesOfAnotherConsultant() throws Exception {
        mockMvc.perform(asUser(get("/view/xyz"), "tst")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(get("/view/xyz/vp1"), "tst")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(delete("/view/xyz/vp1"), "tst")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(post("/view/xyz/view/vp1/t1/report"), "tst")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(get("/view/xyz/view/vp1/t1/preview"), "tst")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(post("/view/xyz"), "tst")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\": \"A\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(asUser(post("/view/update/xyz/vp1"), "tst")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\": \"A\"}"))
                .andExpect(status().isForbidden());

        verify(viewProfileService, never()).getViewProfileIdsForInitials(anyString());
        verify(viewProfileService, never()).deleteWithOwnerCheck(anyString(), anyString());
        verify(viewProfileCreatorService, never()).createViewProfile(any(), any(), any(), any(), any());
        verify(viewProfileMergeService, never()).updateViewProfile(any(), any(), any());
    }

    @Test
    public void userWithoutInitialsGetsNothing() throws Exception {
        mockMvc.perform(get("/view/tst").header(USER_ADMIN_HEADER, "false")).andExpect(status().isForbidden());
    }

    @Test
    public void adminReadsTheViewProfilesOfEveryone() throws Exception {
        mockMvc.perform(get("/view/xyz").header(USER_ADMIN_HEADER, "true").header(USER_INITIALS_HEADER, "adm"))
                .andExpect(status().isOk());
    }

    @Test
    public void callWithoutTheEdgeReadsEverything() throws Exception {
        mockMvc.perform(get("/view/xyz")).andExpect(status().isOk());
    }
}
