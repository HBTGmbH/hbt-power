package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.AbstractIntegrationTest;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Listing and managing consultants lives under /admin (#218); outside it only one consultant and the names are left
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class ConsultantAdminEndpointITest extends AbstractIntegrationTest {

    private static final String ADA = "{\"initials\":\"adm\",\"firstName\":\"Ada\",\"lastName\":\"Admin\",\"birthDate\":\"1990-01-01\"}";
    private static final String ADA_INACTIVE = "{\"initials\":\"adm\",\"firstName\":\"Ada\",\"lastName\":\"Admin\",\"birthDate\":\"1990-01-01\",\"active\":false}";

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void consultantsAreManagedUnderAdmin() throws Exception {
        mockMvc.perform(post("/admin/consultants").contentType(MediaType.APPLICATION_JSON).content(ADA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.initials", is("adm")));
        mockMvc.perform(get("/admin/consultants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].initials", hasItem("adm")));
        mockMvc.perform(get("/admin/consultants/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.initials == 'adm')].name", contains("Ada Admin")));

        mockMvc.perform(patch("/admin/consultants/adm").contentType(MediaType.APPLICATION_JSON).content(ADA_INACTIVE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active", is(false)));
        mockMvc.perform(get("/admin/consultants/info"))
                .andExpect(jsonPath("$[*].initials", not(hasItem("adm"))));

        mockMvc.perform(delete("/admin/consultants/adm")).andExpect(status().isOk());
        mockMvc.perform(get("/admin/consultants"))
                .andExpect(jsonPath("$[*].initials", not(hasItem("adm"))));
    }

    @Test
    public void outsideAdminConsultantsCanNeitherBeListedNorChanged() throws Exception {
        mockMvc.perform(post("/admin/consultants").contentType(MediaType.APPLICATION_JSON).content(ADA))
                .andExpect(status().isOk());

        mockMvc.perform(get("/consultants")).andExpect(status().is4xxClientError());
        mockMvc.perform(get("/consultants/info")).andExpect(status().is4xxClientError());
        mockMvc.perform(post("/consultants?action=new").contentType(MediaType.APPLICATION_JSON).content(ADA))
                .andExpect(status().is4xxClientError());
        mockMvc.perform(patch("/consultants/adm").contentType(MediaType.APPLICATION_JSON).content(ADA_INACTIVE))
                .andExpect(status().is4xxClientError());
        mockMvc.perform(delete("/consultants/adm/delete")).andExpect(status().is4xxClientError());

        // What every user may read
        mockMvc.perform(get("/consultants/adm")).andExpect(status().isOk());
        mockMvc.perform(get("/consultants/names")).andExpect(status().isOk());
    }
}
