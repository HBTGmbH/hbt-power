package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.AbstractIntegrationTest;
import de.hbt.pwr.profile.service.ConsultantService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Profile check endpoints (#139): the account of a confirmation comes from the edge service's headers
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class ProfileCheckEndpointITest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ConsultantService consultantService;

    @Before
    public void createConsultant() {
        consultantService.createNewConsultant("chk", "Clara", "Check", null, null, LocalDate.of(1990, 1, 1));
    }

    @Test
    public void newProfileMissesItsSections() throws Exception {
        mockMvc.perform(get("/profile/chk/check"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.initials", is("chk")))
                .andExpect(jsonPath("$.hints[*].code", hasItems("DESCRIPTION_MISSING", "SECTION_EMPTY")))
                .andExpect(jsonPath("$.hints[*].section", hasItems("LANGUAGES", "PROJECTS")))
                .andExpect(jsonPath("$.skillTreeChecked", is(false)));
    }

    @Test
    public void confirmationIsLoggedWithTheAccountTheEdgeForwards() throws Exception {
        mockMvc.perform(post("/profile/chk/check/confirmation")
                .header("X-Pwr-User-Login", "clara.check@example.org")
                .header("X-Pwr-User-Initials", "chk"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastConfirmed", notNullValue()));

        mockMvc.perform(get("/admin/profile-checks/chk/confirmations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].login", is("clara.check@example.org")))
                .andExpect(jsonPath("$[0].initials", is("chk")));
    }

    @Test
    public void confirmationWithoutTheEdgeIsLoggedAsLocal() throws Exception {
        mockMvc.perform(post("/profile/chk/check/confirmation")).andExpect(status().isOk());

        mockMvc.perform(get("/admin/profile-checks/chk/confirmations"))
                .andExpect(jsonPath("$[0].login", is("lokal")))
                .andExpect(jsonPath("$[0].initials", nullValue()));
    }

    @Test
    public void summaryCountsHintsAndConfirmationsSinceTheLastChange() throws Exception {
        mockMvc.perform(post("/profile/chk/check/confirmation")).andExpect(status().isOk());
        mockMvc.perform(post("/profile/chk/check/confirmation")).andExpect(status().isOk());

        mockMvc.perform(get("/admin/profile-checks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.initials == 'chk')].name", contains("Clara Check")))
                .andExpect(jsonPath("$[?(@.initials == 'chk')].hintCount", contains(greaterThan(0))))
                .andExpect(jsonPath("$[?(@.initials == 'chk')].confirmationsSinceLastChange", contains(2)));
    }

    @Test
    public void unknownInitialsAreNotFound() throws Exception {
        mockMvc.perform(get("/profile/nobody/check")).andExpect(status().isNotFound());
    }
}
