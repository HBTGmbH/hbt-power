package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.client.files.FileUploadClient;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.model.UploadFileResponse;
import de.hbt.pwr.view.service.ReportTemplateService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import java.net.URI;
import java.time.LocalDate;

import static de.hbt.pwr.view.security.ConsultantAccess.USER_ADMIN_HEADER;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Templates are only changed under {@code /admin}, which the edge restricts to admins; the creator comes from the
 * account header (#203)
 */
@RunWith(SpringRunner.class)
@WebMvcTest({ReportTemplateController.class, ReportTemplateAdminController.class})
@ActiveProfiles("test")
public class ReportTemplateAdminControllerTest {

    private static final String LOGIN = "erika.testerin@example.com";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportTemplateService reportTemplateService;

    @MockBean
    private FileUploadClient fileUploadClient;

    @SuppressWarnings("unused")
    @MockBean
    private RedisConnectionFactory redisConnectionFactory;

    private final MockMultipartFile designFile =
            new MockMultipartFile("file", "design.rptdesign", "application/octet-stream", "<report/>".getBytes());

    private final ReportTemplate stored = ReportTemplate.builder()
            .id("t1").name("Standard").description("Alt").fileId("design").previewId("")
            .createUser("anna.admin@example.com").createdDate(LocalDate.of(2020, 1, 1)).build();

    @Before
    public void setUp() {
        given(fileUploadClient.uploadFile(any()))
                .willReturn(ResponseEntity.ok(new UploadFileResponse("design", "design.rptdesign", "", "", 9)));
        given(reportTemplateService.saveTemplate(any())).willAnswer(invocation -> invocation.getArgument(0));
        given(reportTemplateService.updateTemplate(eq("t1"), any())).willAnswer(invocation -> invocation.getArgument(1));
        given(reportTemplateService.getTemplate("t1")).willReturn(stored);
    }

    @Test
    public void uploadTakesTheCreatorFromTheHeaderAndIgnoresTheOneSent() throws Exception {
        mockMvc.perform(multipart("/admin/template").file(designFile)
                .param("templateSlice", "{\"name\":\"Neu\",\"description\":\"Mit \\\"Zitat\\\"\",\"createUser\":\"Mallory\"}")
                .header(ReportTemplateAdminController.USER_LOGIN_HEADER, LOGIN))
                .andExpect(status().isOk());

        ReportTemplate saved = savedTemplate();
        assertThat(saved.getCreateUser()).isEqualTo(LOGIN);
        assertThat(saved.getName()).isEqualTo("Neu");
        assertThat(saved.getDescription()).isEqualTo("Mit \"Zitat\"");
        assertThat(saved.getFileId()).isEqualTo("design");
    }

    /**
     * Locally there is no edge that sets the header
     */
    @Test
    public void uploadWithoutHeaderHasNoCreator() throws Exception {
        mockMvc.perform(multipart("/admin/template").file(designFile)
                .param("templateSlice", "{\"name\":\"Neu\",\"description\":\"\"}"))
                .andExpect(status().isOk());

        assertThat(savedTemplate().getCreateUser()).isEmpty();
    }

    @Test
    public void updateKeepsCreatorAndCreationDate() throws Exception {
        mockMvc.perform(post("/admin/template/t1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Umbenannt\",\"description\":\"\",\"createUser\":\"Mallory\"}"))
                .andExpect(status().isOk());

        ArgumentCaptor<ReportTemplate> captor = ArgumentCaptor.forClass(ReportTemplate.class);
        verify(reportTemplateService).updateTemplate(eq("t1"), captor.capture());
        ReportTemplate updated = captor.getValue();
        assertThat(updated.getName()).isEqualTo("Umbenannt");
        assertThat(updated.getDescription()).isEqualTo("Alt");
        assertThat(updated.getFileId()).isEqualTo("design");
        assertThat(updated.getCreateUser()).isEqualTo("anna.admin@example.com");
        assertThat(updated.getCreatedDate()).isEqualTo(LocalDate.of(2020, 1, 1));
    }

    @Test
    public void deleteRemovesTheTemplateAndItsFile() throws Exception {
        mockMvc.perform(delete("/admin/template/t1"))
                .andExpect(status().isOk());

        verify(fileUploadClient).deleteFile("design");
        verify(fileUploadClient, never()).deleteFile("");
        verify(reportTemplateService).deleteTemplate("t1");
    }

    /**
     * Outside {@code /admin} the edge lets every user through, so only reading is left there
     */
    @Test
    public void templatesAreNotChangedOutsideAdmin() throws Exception {
        mockMvc.perform(multipart("/template").file(designFile).param("templateSlice", "{\"name\":\"Neu\"}"))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(post("/template/t1").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"x\"}"))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(delete("/template/t1"))
                .andExpect(status().isMethodNotAllowed());

        verify(fileUploadClient, never()).uploadFile(any());
        verify(reportTemplateService, never()).deleteTemplate(any());
    }

    private ReportTemplate savedTemplate() {
        ArgumentCaptor<ReportTemplate> captor = ArgumentCaptor.forClass(ReportTemplate.class);
        verify(reportTemplateService).saveTemplate(captor.capture());
        return captor.getValue();
    }

    /**
     * The service lets only admins reach /admin itself, however the path is written (#260)
     */
    @Test
    public void onlyAnAdminReachesTheAdminEndpoints() throws Exception {
        mockMvc.perform(get("/admin/template/files").header(USER_ADMIN_HEADER, "false"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/admin;x/template/files").header(USER_ADMIN_HEADER, "false"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get(URI.create("/%61dmin/template/files")).header(USER_ADMIN_HEADER, "false"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/admin/template/files").header(USER_ADMIN_HEADER, "true")).andExpect(status().isOk());
        mockMvc.perform(get("/admin/template/files")).andExpect(status().isOk());
    }
}
