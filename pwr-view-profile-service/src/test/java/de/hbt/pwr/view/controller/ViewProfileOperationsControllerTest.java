package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.model.ProfileEntryType;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.entries.sort.NameComparableEntryType;
import de.hbt.pwr.view.model.entries.sort.StartEndDateComparableEntryType;
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

import java.util.Arrays;

import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SuppressWarnings("ConstantConditions")
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
    private ViewProfileService viewProfileService;

    @MockBean
    private ViewProfileSortService viewProfileSortService;

    @MockBean
    // DO NOT REMOVE. Stops the container for crashing. Don't ask why ~nt
    private JedisConnectionFactory jedisConnectionFactory;

    private ViewProfile viewProfileReturned = new ViewProfile();

    private String initials = "tst";

    private String viewProfileId = "ABCD";

    private final static Boolean isVisible = true;

    @Before
    public void setUp() {
        given(viewProfileService.getByIdAndCheckOwner(viewProfileId, initials)).willReturn(viewProfileReturned);
    }

    private void assertOwnerCheckAndRetrieval() {
        then(viewProfileService).should(times(1)).getByIdAndCheckOwner(viewProfileId, initials);
    }

    /**
     * Invokes the patch operation with application/json and expected to return 200
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
        then(viewProfileService).should(times(1)).setIsEnabled(viewProfileReturned, index, isVisible, entryType);
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
    public void enablesSkillAndReturns200() throws Exception {
        String skillName = "Foo";
        String url = urlBasePath() + "SKILL/visibility/" + isVisible;
        mockMvc.perform(patch(url).param("skill-name", skillName).contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setIsEnabledForSkill(viewProfileReturned, skillName, isVisible);
    }

    @Test
    public void enablesAllSkillsAndReturns200() throws  Exception {
        String url = urlBasePath() + "SKILL/visibility/" + isVisible;
        mockMvc.perform(patch(url).contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setIsEnabledForAllSkills(viewProfileReturned, isVisible);
    }


    @Test
    public void enabledAllSkillsInProjectAndReturns200() throws Exception {
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
        String skillName = "skillSkill";
        String newDisplayCategoryName = "FooBar";
        String url = urlBasePath() + "/SKILL/display-category";
        mockMvc.perform(patch(url)
                .param("display-category", newDisplayCategoryName)
                .param("skill-name", skillName)
                .accept(MediaType.APPLICATION_JSON)
        ).andExpect(status().isOk());
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setDisplayCategory(viewProfileReturned, skillName, newDisplayCategoryName);
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
    public void allProfileEntriesAreMovableAndReturn200() throws Exception {
        int sourceIndex = 0;
        int targetIndex = 33;
        int times = 0;
        for (ProfileEntryType profileEntryType : ProfileEntryType.values()) {
            times++;
            String url = urlBasePath() + "/" + profileEntryType + "/position/" + sourceIndex + "/" + targetIndex;
            mockMvc.perform(patch(url)).andExpect(status().isOk());
            then(viewProfileService).should(times(times)).getByIdAndCheckOwner(viewProfileId, initials);
            // Only checks that the service has been invoked properly; The validation
            // that the moving works is done in the ViewProfileMoveTest
            then(viewProfileSortService)
                    .should(times(1))
                    .move(viewProfileReturned, profileEntryType, sourceIndex, targetIndex);
            // Reset the service
            setUp();
        }
    }

    @Test
    public void sortsAllNameSortAblesAndReturns200() throws Exception {
        int expectedTimes = 0;
        for (NameComparableEntryType nameComparableEntryType : NameComparableEntryType.values()) {
            expectedTimes++;
            String url = urlBasePath() + "/" + nameComparableEntryType.toString() +  "/name/order";
            final Boolean doAscending = true;
            mockMvc.perform(patch(url).param("do-ascending", doAscending.toString()).accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());

            then(viewProfileService)
                    .should(times(expectedTimes))
                    .getByIdAndCheckOwner(viewProfileId, initials);

            then(viewProfileSortService)
                    .should(times(1))
                    .sortEntryByName(viewProfileReturned, nameComparableEntryType, doAscending);
        }
    }

    @Test
    public void sortsAllStartEndDateSortAblesAndReturns200() throws Exception {
        int expectedTimes = 0;
        final Boolean doAscending = true;
        for (StartEndDateComparableEntryType entryType : StartEndDateComparableEntryType.values()) {
            for(String field: Arrays.asList("end-date", "start-date")) {
                expectedTimes++;
                String url = urlBasePath() + "/" + entryType.toString() +  "/" + field + "/order";
                mockMvc.perform(patch(url).param("do-ascending", doAscending.toString()).accept(MediaType.APPLICATION_JSON))
                        .andExpect(status().isOk());
                then(viewProfileService)
                        .should(times(expectedTimes))
                        .getByIdAndCheckOwner(viewProfileId, initials);
            }
            then(viewProfileSortService)
                    .should(times(1))
                    .sortEntryByEndDate(viewProfileReturned, entryType, doAscending);
            then(viewProfileSortService)
                    .should(times(1))
                    .sortEntryByEndDate(viewProfileReturned, entryType, doAscending);
        }
    }

    @Test
    public void setsDescriptionAndReturns200() throws Exception {
        String url = urlBasePath() + "/DESCRIPTION";
        String newDescription = "afdpojafpajfkasfasdä1''''sda,.a^^wdasda--";
        mockMvc.perform(patch(url).content(newDescription).contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
        assertOwnerCheckAndRetrieval();
        then(viewProfileService).should(times(1)).setDescription(viewProfileReturned, newDescription);
    }

    @Test
    public void createsCategoryAndReturns200() throws Exception {
        String url = urlBasePath() + "/CATEGORY";
        String parentName = "Smithing";
        String newCategoryName = "Goldsmithing";
        mockMvc.perform(post(url).param("parent-name", parentName).param("category-name", newCategoryName))
                .andExpect(status().isOk());
        assertOwnerCheckAndRetrieval();
        then(viewProfileService)
                .should(times(1))
                .addNewCategory(viewProfileReturned, parentName, newCategoryName);
    }
}