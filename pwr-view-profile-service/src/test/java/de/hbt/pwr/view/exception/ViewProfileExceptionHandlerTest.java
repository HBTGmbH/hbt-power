package de.hbt.pwr.view.exception;

import de.hbt.pwr.view.client.report.ReportServiceClient;
import de.hbt.pwr.view.controller.ViewProfileController;
import de.hbt.pwr.view.service.ReportTemplateService;
import de.hbt.pwr.view.service.StorageService;
import de.hbt.pwr.view.service.ViewProfileImporter;
import de.hbt.pwr.view.service.ViewProfileService;
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

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests that the exception mapper does correct mapping and is actually invoked correctly.
 */
@RunWith(SpringRunner.class)
@WebMvcTest(ViewProfileController.class)
@ActiveProfiles("test")
public class ViewProfileExceptionHandlerTest {
    @SuppressWarnings("unused")
    @MockBean
    // DO NOT REMOVE. Stops the container for crashing. Don't ask why ~nt
    private RedisConnectionFactory redisConnectionFactory;

    // DO NOT REMOVE. Needs to exist so the app context loads properly.
    @SuppressWarnings("unused")
    @MockBean
    private ReportServiceClient reportServiceClient;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ViewProfileService viewProfileService;

    @SuppressWarnings("unused")
    @MockBean
    private ViewProfileImporter viewProfileImporter;

    @MockBean
    private ReportTemplateService reportTemplateService;

    @MockBean
    private StorageService storageService;

    @Test
    public void shouldReturnForbidden403() throws Exception {
        given(viewProfileService.getViewProfileIdsForInitials("fooBar")).willThrow(new InvalidOwnerException("12", "fooBar"));
        String url = "/view/fooBar";
        mockMvc.perform(get(url).accept(MediaType.APPLICATION_JSON)).andExpect(status().isForbidden());
    }

    @Test
    public void shouldReturnNotFound404() throws Exception {
        given(viewProfileService.getViewProfileIdsForInitials("fooBar")).willThrow(new ViewProfileNotFoundException("12"));
        String url = "/view/fooBar";
        mockMvc.perform(get(url).accept(MediaType.APPLICATION_JSON)).andExpect(status().isNotFound());
    }

    /**
     * Validates that the exception handling for a {@link DisplayCategoryNotFoundException} works and returns
     * a 400 bad request.
     */
    @Test
    public void shouldReturnBadRequest400() throws Exception {
        given(viewProfileService.getViewProfileIdsForInitials("fooBar")).willThrow(new DisplayCategoryNotFoundException("12", "12", "12"));
        String url = "/view/fooBar";
        mockMvc.perform(get(url).accept(MediaType.APPLICATION_JSON)).andExpect(status().isBadRequest());
    }

    @Test
    public void shouldReturnConflict409() throws Exception {
        given(viewProfileService.getViewProfileIdsForInitials("fooBar")).willThrow(new CategoryNotUniqueException("12"));
        String url = "/view/fooBar";
        mockMvc.perform(get(url).accept(MediaType.APPLICATION_JSON)).andExpect(status().isConflict());
    }

    @Test
    public void shouldReturnBadRequest400CategoryMissing() throws Exception {
        given(viewProfileService.getViewProfileIdsForInitials("fooBar")).willThrow(new CategoryNotFoundException("12"));
        String url = "/view/fooBar";
        mockMvc.perform(get(url).accept(MediaType.APPLICATION_JSON)).andExpect(status().isBadRequest());
    }

    @Test
    public void shouldReturnBadRequestBecauseConsultantDoesNotExist() throws Exception {
        given(viewProfileService.getViewProfileIdsForInitials("fooBar")).willThrow(new NoProfileAvailableException("fooBar"));
        String url = "/view/fooBar";
        mockMvc.perform(get(url)).andExpect(status().isBadRequest());
    }

    @Test
    public void shouldReturnNotFoundViewProfileMissing() throws Exception {
        String id = "24152safr125rq";
        given(reportTemplateService.getTemplate(id)).willThrow(new TemplateNotFoundException(id));
        String url = "/template/" + id;
        mockMvc.perform(get(url)).andExpect(status().isNotFound());
    }
}