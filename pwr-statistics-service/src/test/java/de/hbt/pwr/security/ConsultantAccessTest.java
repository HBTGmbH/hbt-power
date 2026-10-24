package de.hbt.pwr.security;

import de.hbt.pwr.controller.ProfileStatisticsController;
import de.hbt.pwr.controller.StatisticsAdminController;
import de.hbt.pwr.service.AsyncInformationService;
import de.hbt.pwr.service.StatisticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.net.URI;

import static de.hbt.pwr.security.ConsultantAccess.USER_ADMIN_HEADER;
import static de.hbt.pwr.security.ConsultantAccess.USER_INITIALS_HEADER;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * A user gets the statistics of the own profile only, an admin everyone's (#255); search and cluster info stay open
 */
@WebMvcTest
@ContextConfiguration(classes = {ProfileStatisticsController.class, StatisticsAdminController.class,
        ConsultantAccessConfig.class})
class ConsultantAccessTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StatisticsService statisticsService;

    @MockBean
    private AsyncInformationService asyncInformationService;

    @Test
    void userGetsTheOwnProfileStatistics() throws Exception {
        mockMvc.perform(asUser(get("/statistics/skill/common/CHK"), "chk")).andExpect(status().isOk());
    }

    @Test
    void userGetsNoProfileStatisticsOfAnotherConsultant() throws Exception {
        mockMvc.perform(asUser(get("/statistics/skill/common/xyz"), "chk")).andExpect(status().isForbidden());
    }

    @Test
    void userWithoutInitialsGetsNoProfileStatistics() throws Exception {
        mockMvc.perform(get("/statistics/skill/common/chk").header(USER_ADMIN_HEADER, "false"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminGetsTheProfileStatisticsOfEveryone() throws Exception {
        mockMvc.perform(get("/statistics/skill/common/xyz")
                        .header(USER_ADMIN_HEADER, "true")
                        .header(USER_INITIALS_HEADER, "ada"))
                .andExpect(status().isOk());
    }

    @Test
    void callWithoutTheEdgeGetsEverything() throws Exception {
        mockMvc.perform(get("/statistics/skill/common/xyz")).andExpect(status().isOk());
    }

    @Test
    void clusterInfoAndSearchStayOpenToEveryUser() throws Exception {
        mockMvc.perform(asUser(get("/statistics/network/consultant/xyz"), "chk")).andExpect(status().isOk());
        mockMvc.perform(asUser(post("/statistics/consultant/find/skills"), "chk")
                        .contentType(APPLICATION_JSON).content("[\"Java\"]"))
                .andExpect(status().isOk());
    }

    private static MockHttpServletRequestBuilder asUser(MockHttpServletRequestBuilder request, String initials) {
        return request.header(USER_ADMIN_HEADER, "false").header(USER_INITIALS_HEADER, initials);
    }

    /**
     * The service lets only admins reach /admin itself, however the path is written (#260)
     */
    @Test
    void onlyAnAdminReachesTheAdminEndpoints() throws Exception {
        mockMvc.perform(asUser(post("/admin/consultants/refresh"), "chk")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(post("/admin;x/consultants/refresh"), "chk")).andExpect(status().isForbidden());
        mockMvc.perform(asUser(post(URI.create("/%61dmin/consultants/refresh")), "chk"))
                .andExpect(status().isForbidden());
        mockMvc.perform(asUser(get("/admin/statistics/skill/referencing?skill=Java"), "chk"))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/admin/consultants/refresh").header(USER_ADMIN_HEADER, "true"))
                .andExpect(status().isNoContent());
        mockMvc.perform(post("/admin/consultants/refresh")).andExpect(status().isNoContent());
    }
}
