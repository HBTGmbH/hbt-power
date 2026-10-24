package de.hbt.controller;

import de.hbt.client.ProfilePictureClient;
import de.hbt.data.ReportDataRepository;
import de.hbt.model.ReportData;
import de.hbt.service.TestConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Deleting a consultant deletes the documents about the consultant, not those the consultant exported for others
 * (#240), only under {@code /admin}
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Import(TestConfiguration.class)
class ReportAdminControllerITest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ReportDataRepository reportDataRepository;

    @MockBean
    private ProfilePictureClient profilePictureClient;

    @BeforeEach
    void setUp() {
        reportDataRepository.deleteAll();
    }

    private ReportData report(String initials, String exportedByInitials) {
        return reportDataRepository.saveAndFlush(new ReportData(initials, "Bewerbung", null, initials + ".docx",
                "template", exportedByInitials, exportedByInitials + " Name"));
    }

    @Test
    void deletesTheDocumentsAboutTheConsultant_butNotThoseTheConsultantExportedForOthers() throws Exception {
        report("old", "old");
        report("old", "adm");
        ReportData exportedForOthers = report("kai", "old");

        mockMvc.perform(delete("/admin/report/old"))
                .andExpect(status().isNoContent());

        assertThat(reportDataRepository.findAllByInitials("old")).isEmpty();
        assertThat(reportDataRepository.findAll()).extracting(ReportData::getId).containsExactly(exportedForOthers.getId());
    }

    @Test
    void withoutDocuments_deletingSucceeds_soItCanBeRepeated() throws Exception {
        mockMvc.perform(delete("/admin/report/none"))
                .andExpect(status().isNoContent());
    }

    /**
     * Outside {@code /admin} the edge would let every user through
     */
    @Test
    void isOnlyUnderAdmin() throws Exception {
        report("old", "old");

        mockMvc.perform(delete("/report/old"));

        assertThat(reportDataRepository.findAllByInitials("old")).hasSize(1);
    }
}
