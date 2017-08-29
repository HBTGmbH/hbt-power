package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.model.ProfileEntryType;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.service.ViewProfileService;
import de.hbt.pwr.view.service.ViewProfileSortService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
    public ViewProfileSortService viewProfileSortService;

    @MockBean
    // DO NOT REMOVE. Stops the container for crashing. Don't ask why ~nt
    private JedisConnectionFactory jedisConnectionFactory;

    private ViewProfile viewProfileReturned = new ViewProfile();

    private String initials = "tst";

    private String viewProfileId = "ABCD";

    final Boolean isVisible = true;

    @Before
    public void setUp() {
        given(viewProfileService.getByIdAndCheckOwner(viewProfileId, initials)).willReturn(viewProfileReturned);
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

    private String urlBasePath() {
        return "/" + initials + "/view/" + viewProfileId + "/";
    }

    @Test
    public void retrievesProfileAndPerformsEnablingAndReturns200() throws Exception {
        ProfileEntryType entryType = ProfileEntryType.LANGUAGE;
        Integer index = 0;
        String url = urlBasePath() + entryType + "/" + index + "/visibility/" + isVisible;

        patchAndAssertStatus200(url);
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setEntryEnabled(viewProfileReturned, index, isVisible, entryType);
    }

    @Test
    public void retrievesProfileAndPerformsEnablingForSkillInProjectAndReturns200() throws Exception {
        Integer index = 0;
        Integer projectIndex = 0;
        String url = urlBasePath() + "/PROJECT/" + projectIndex + "/SKILL/"+ index + "/visibility/" + isVisible;

        patchAndAssertStatus200(url);
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setSkillInProjectEnabled(viewProfileReturned, projectIndex, index, isVisible);
    }

    @Test
    public void retrievesProfileAndPerformsEnablingForRoleInProjectAndReturns200() throws Exception {
        Integer index = 0;
        Integer projectIndex = 0;
        String url = urlBasePath() + "/PROJECT/" + projectIndex + "/ROLE/"+ index + "/visibility/" + isVisible;

        patchAndAssertStatus200(url);
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setRoleInProjectEnabled(viewProfileReturned, projectIndex, index, isVisible);
    }

    @Test
    public void enabledAllEntriesAndReturns200() throws Exception {
        ProfileEntryType profileEntryType = ProfileEntryType.CAREER;
        String url = urlBasePath() + profileEntryType + "/all/visibility/" + isVisible;

        patchAndAssertStatus200(url);
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setIsEnabledForAll(viewProfileReturned, profileEntryType, isVisible);
    }

    @Test
    public void enabledAllSkillsInProfileAndReturns200() throws Exception {
        Integer projectIndex = 0;
        String url = urlBasePath() + "/PROJECT/" + projectIndex + "/SKILL/all/visibility/" + isVisible;

        patchAndAssertStatus200(url);
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setIsEnabledForAllSkillsInProject(viewProfileReturned,projectIndex, isVisible);
    }

    @Test
    public void enabledAllRolesInProfileAndReturns200() throws Exception {
        Integer projectIndex = 0;
        String url = urlBasePath()+ "/PROJECT/" + projectIndex + "/ROLE/all/visibility/" + isVisible;
        patchAndAssertStatus200(url);
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setIsEnabledForAllRolesInProject(viewProfileReturned, projectIndex, isVisible);
    }

    /**
     * Validates that the correct service methods are being called when a display category is supposed to be changed
     * and that the correct call returns a status code of 200.
     */
    @Test
    public void changesDisplayCategoryAndReturns200() throws Exception {
        int skillIndex = 0;
        String newDisplayCategoryName = "FooBar";
        String url = urlBasePath() + "/SKILL/" + skillIndex + "/display-category";
        mockMvc.perform(patch(url)
                .param("display-category", newDisplayCategoryName)
                .accept(MediaType.APPLICATION_JSON)
        ).andExpect(status().isOk());
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setDisplayCategory(viewProfileReturned, skillIndex, newDisplayCategoryName);
    }

    @Test
    public void sortsDisplayCategoriesAndReturns200() throws Exception {
        String url = urlBasePath() + "/DISPLAY_CATEGORY/order";
        final Boolean doAscending = true;
        mockMvc.perform(patch(url).param("do-ascending", doAscending.toString()).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        assertOwnerCheckAndRetrieval();
        then(viewProfileSortService).should(times(1)).sortDisplayCategoriesByName(viewProfileReturned, doAscending);
    }

    @Test
    public void sortsSkillsByNameInDisplayAndReturns200() throws Exception {
        int displayCategoryIndex = 3;
        String url = urlBasePath() + "/DISPLAY_CATEGORY/" + displayCategoryIndex + "/SKILL/name/order";
        final Boolean doAscending = false;
        mockMvc.perform(patch(url).param("do-ascending", doAscending.toString()).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        assertOwnerCheckAndRetrieval();
        then(viewProfileSortService).should(times(1)).sortSkillsInDisplayByName(viewProfileReturned, displayCategoryIndex, doAscending);
    }

    @Test
    public void sortsSkillsByRatingInDisplayAndReturns200() throws Exception {
        int displayCategoryIndex = 999;
        String url = urlBasePath() + "/DISPLAY_CATEGORY/" + displayCategoryIndex + "/SKILL/rating/order";
        final Boolean doAscending = false;
        mockMvc.perform(patch(url).param("do-ascending", doAscending.toString()).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        assertOwnerCheckAndRetrieval();
        then(viewProfileSortService).should(times(1)).sortSkillsInDisplayByRating(viewProfileReturned, displayCategoryIndex, doAscending);
    }

    @Test
    public void movesSkillInDisplayAndReturns200() throws Exception {
        int displayCategoryIndex = 999;
        int sourceIndex = 0;
        int targetIndex = 20;
        String url = urlBasePath() + "/DISPLAY_CATEGORY/" + displayCategoryIndex + "/SKILL/position/" + sourceIndex + "/" + targetIndex;
        mockMvc.perform(patch(url).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        assertOwnerCheckAndRetrieval();
        then(viewProfileSortService)
                .should(times(1))
                .moveSkillInDisplayCategory(viewProfileReturned, displayCategoryIndex, sourceIndex, targetIndex);
    }

    @Test
    public void movesDisplayCategoryAndReturns200() throws Exception {
        int sourceIndex = 0;
        int targetIndex = 20;
        String url = urlBasePath() + "/DISPLAY_CATEGORY/position/" + sourceIndex + "/" + targetIndex;
        mockMvc.perform(patch(url).accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
        assertOwnerCheckAndRetrieval();
        then(viewProfileSortService)
                .should(times(1))
                .moveDisplayCategory(viewProfileReturned, sourceIndex, targetIndex);
    }
}