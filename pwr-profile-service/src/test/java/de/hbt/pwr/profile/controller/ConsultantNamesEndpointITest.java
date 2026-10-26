package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.AbstractIntegrationTest;
import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.model.Consultant;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Names of the consultants for the webclient (#216): short and full name and whether active (#350), nothing else
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class ConsultantNamesEndpointITest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ConsultantService consultantService;

    @Autowired
    private ConsultantRepository consultantRepository;

    @Before
    public void createConsultants() {
        consultantService.createNewConsultant("nk1", "Kainame", "Brandt", "Senior Consultant", null, LocalDate.of(1990, 1, 1));
        consultantService.createNewConsultant("nk2", "Kainame", "Meier", null, null, LocalDate.of(1990, 1, 1));
    }

    @Test
    public void namesAreShortAndFull() throws Exception {
        mockMvc.perform(get("/consultants/names"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.initials == 'nk1')].shortName", contains("Kainame B.")))
                .andExpect(jsonPath("$[?(@.initials == 'nk1')].fullName", contains("Kainame Brandt")))
                .andExpect(jsonPath("$[?(@.initials == 'nk2')].shortName", contains("Kainame M.")));
    }

    @Test
    public void namesSayWhetherTheConsultantIsActive() throws Exception {
        Consultant inactive = consultantRepository.findByInitials("nk2").orElseThrow();
        inactive.setActive(false);
        consultantRepository.save(inactive);

        mockMvc.perform(get("/consultants/names"))
                .andExpect(jsonPath("$[?(@.initials == 'nk1')].active", contains(true)))
                .andExpect(jsonPath("$[?(@.initials == 'nk2')].active", contains(false)));
    }

    @Test
    public void namesCarryNoOtherData() throws Exception {
        mockMvc.perform(get("/consultants/names"))
                .andExpect(jsonPath("$[0].*", hasSize(4)))
                .andExpect(jsonPath("$[0].birthDate").doesNotExist())
                .andExpect(jsonPath("$[0].profile").doesNotExist());
    }
}
