package de.hbt.controller;

import de.hbt.client.ProfilePictureClient;
import de.hbt.model.files.DBFile;
import de.hbt.repository.DBFileRepository;
import de.hbt.service.TestConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Stored files (BIRT designs): a missing file is not found, deleting one that is gone succeeds (#112), all of it only
 * under {@code /admin} (#203)
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Import(TestConfiguration.class)
class FileUploadControllerITest {

    private static final String UNKNOWN_ID = "00000000-0000-0000-0000-000000000000";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DBFileRepository dbFileRepository;

    @MockBean
    private ProfilePictureClient profilePictureClient;

    private DBFile storedFile() {
        byte[] data = "<report/>".getBytes(StandardCharsets.UTF_8);
        return dbFileRepository.saveAndFlush(new DBFile("design.rptdesign", "application/octet-stream", data));
    }

    @Test
    void downloadReturnsTheStoredFile() throws Exception {
        DBFile file = storedFile();

        mockMvc.perform(get("/admin/file/" + file.getId()))
                .andExpect(status().isOk())
                .andExpect(content().string("<report/>"));
    }

    @Test
    void downloadOfAMissingFileIsNotFound() throws Exception {
        mockMvc.perform(get("/admin/file/" + UNKNOWN_ID))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteRemovesTheFile() throws Exception {
        DBFile file = storedFile();

        mockMvc.perform(delete("/admin/file/" + file.getId()))
                .andExpect(status().isOk());

        assertThat(dbFileRepository.findById(file.getId())).isEmpty();
    }

    /**
     * Outside {@code /admin} the edge would let every user through
     */
    @Test
    void filesAreNotServedOutsideAdmin() throws Exception {
        DBFile file = storedFile();

        mockMvc.perform(get("/file/" + file.getId()))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/file/" + file.getId()))
                .andExpect(status().isNotFound());

        assertThat(dbFileRepository.findById(file.getId())).isPresent();
    }

    /**
     * Deleting a template also deletes its files; one that is already gone must not make that fail
     */
    @Test
    void deleteOfAMissingFileSucceeds() throws Exception {
        mockMvc.perform(delete("/admin/file/" + UNKNOWN_ID))
                .andExpect(status().isOk());
    }
}
