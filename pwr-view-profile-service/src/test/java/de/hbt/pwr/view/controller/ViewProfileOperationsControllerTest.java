package de.hbt.pwr.view.controller;

import com.sun.org.apache.xpath.internal.operations.Bool;
import de.hbt.pwr.view.model.ProfileEntryType;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.service.ViewProfileService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.embedded.LocalServerPort;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.in;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@RunWith(SpringRunner.class)
@WebMvcTest(ViewProfileOperationsController.class)
@ActiveProfiles("test")
public class ViewProfileOperationsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * IMPORTANT:
     *
     * The service is only mocked; Subsequently, it is only checked if the correct methods in the service
     * are invoked, not that the methods actually do the right thing. For validation of the service functionality,
     * refer to {@link de.hbt.pwr.view.service.ViewProfileVisibilityTests}
     */
    @MockBean
    public ViewProfileService viewProfileService;

    @MockBean
    // DO NOT REMOVE. Stops the container for crashing. Don't ask why ~nt
    private JedisConnectionFactory jedisConnectionFactory;

    private ViewProfile profileToReturn = new ViewProfile();

    private String initials = "tst";

    private String viewProfileId = "ABCD";

    final Boolean isVisible = true;

    @Before
    public void setUp() {
        given(viewProfileService.getByIdAndCheckOwner(viewProfileId, initials)).willReturn(profileToReturn);
    }

    private void assertOwnerCheckAndRetrieval() {
        then(viewProfileService).should(times(1)).getByIdAndCheckOwner(viewProfileId, initials);
    }

    /**
     * Invokes the patch operation with application/json and expectes to return 200
     */
    private void patchAndAssertStatus200(String url) throws Exception {
        mockMvc.perform(patch(url).accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
    }

    @Test
    public void retrievesProfileAndPerformsEnablingAndReturns200() throws Exception {
        ProfileEntryType entryType = ProfileEntryType.LANGUAGE;
        Integer index = 0;
        String url = "/" + initials + "/view/" + viewProfileId + "/" + entryType + "/" + index + "/visibility/" + isVisible;

        patchAndAssertStatus200(url);
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setEntryEnabled(profileToReturn, index, isVisible, entryType);
    }

    @Test
    public void retrievesProfileAndPerformsEnablingForSkillInProjectAndReturns200() throws Exception {
        Integer index = 0;
        Integer projectIndex = 0;
        String url = "/" + initials + "/view/" + viewProfileId + "/PROJECT/" + projectIndex + "/SKILL/"+ index + "/visibility/" + isVisible;

        patchAndAssertStatus200(url);
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setSkillInProjectEnabled(profileToReturn, projectIndex, index, isVisible);
    }

    @Test
    public void retrievesProfileAndPerformsEnablingForRoleInProjectAndReturns200() throws Exception {
        Integer index = 0;
        Integer projectIndex = 0;
        String url = "/" + initials + "/view/" + viewProfileId + "/PROJECT/" + projectIndex + "/ROLE/"+ index + "/visibility/" + isVisible;

        patchAndAssertStatus200(url);
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setRoleInProjectEnabled(profileToReturn, projectIndex, index, isVisible);
    }

    @Test
    public void enabledAllEntriesAndReturns200() throws Exception {
        ProfileEntryType profileEntryType = ProfileEntryType.CAREER;
        String url = "/" + initials + "/view/" + viewProfileId + "/" + profileEntryType + "/all/visibility/" + isVisible;

        patchAndAssertStatus200(url);
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setIsEnabledForAll(profileToReturn, profileEntryType, isVisible);
    }

    @Test
    public void enabledAllSkillsInProfileAndReturns200() throws Exception {
        Integer projectIndex = 0;
        String url = "/" + initials + "/view/" + viewProfileId + "/PROJECT/" + projectIndex + "/SKILL/all/visibility/" + isVisible;

        patchAndAssertStatus200(url);
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setIsEnabledForAllSkillsInProject(profileToReturn,projectIndex, isVisible);
    }

    @Test
    public void enabledAllRolesInProfileAndReturns200() throws Exception {
        Integer projectIndex = 0;
        String url = "/" + initials + "/view/" + viewProfileId + "/PROJECT/" + projectIndex + "/ROLE/all/visibility/" + isVisible;
        patchAndAssertStatus200(url);
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setIsEnabledForAllRolesInProject(profileToReturn, projectIndex, isVisible);
    }

    /**
     * Validates that the correct service methods are being called when a display category is supposed to be changed
     * and that the correct call returns a status code of 200.
     */
    @Test
    public void changesDisplayCategoryAndReturns200() throws Exception {
        int skillIndex = 0;
        String newDisplayCategoryName = "FooBar";
        String url = "/" + initials + "/view/" + viewProfileId + "/SKILL/" + skillIndex + "/display-category";
        mockMvc.perform(patch(url)
                .param("display-category", newDisplayCategoryName)
                .accept(MediaType.APPLICATION_JSON)
        ).andExpect(status().isOk());
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setDisplayCategory(profileToReturn, skillIndex, newDisplayCategoryName);
    }
}