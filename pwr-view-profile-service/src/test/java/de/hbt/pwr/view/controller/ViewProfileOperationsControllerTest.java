package de.hbt.pwr.view.controller;

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

    @MockBean
    public ViewProfileService viewProfileService;

    @MockBean
    private JedisConnectionFactory jedisConnectionFactory;

    @Test
    public void retrievesProfileAndPerformsEnablingAndReturns200() throws Exception {
        String initials = "tst";
        String viewProfileId = "ABCD";
        ProfileEntryType entryType = ProfileEntryType.LANGUAGE;
        Integer index = 0;
        Boolean isVisible = true;
        String url = "/" + initials + "/view/" + viewProfileId + "/" + entryType + "/" + index + "/visibility/" + isVisible;
        ViewProfile profileToReturn = new ViewProfile();
        given(viewProfileService.getByIdAndCheckOwner(viewProfileId, initials)).willReturn(profileToReturn);
        mockMvc.perform(patch(url).accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
        then(viewProfileService).should(times(1)).getByIdAndCheckOwner(viewProfileId, initials);
        then(viewProfileService).should(times(1)).setEntryEnabled(profileToReturn, index, isVisible, entryType);
    }

    @Test
    public void retrievesProfileAndPerformsEnablingForSkillInProjectAndReturns200() throws Exception {
        String initials = "tst";
        String viewProfileId = "ABCD";
        Integer index = 0;
        Integer projectIndex = 0;
        Boolean isVisible = true;
        String url = "/" + initials + "/view/" + viewProfileId + "/PROJECT/" + projectIndex + "/SKILL/"+ index + "/visibility/" + isVisible;
        ViewProfile profileToReturn = new ViewProfile();
        given(viewProfileService.getByIdAndCheckOwner(viewProfileId, initials)).willReturn(profileToReturn);
        mockMvc.perform(patch(url).accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
        then(viewProfileService).should(times(1)).getByIdAndCheckOwner(viewProfileId, initials);
        then(viewProfileService).should(times(1)).setSkillInProjectEnabled(profileToReturn, projectIndex, index, isVisible);
    }

    @Test
    public void retrievesProfileAndPerformsEnablingForRoleInProjectAndReturns200() throws Exception {
        String initials = "tst";
        String viewProfileId = "ABCD";
        Integer index = 0;
        Integer projectIndex = 0;
        Boolean isVisible = true;
        String url = "/" + initials + "/view/" + viewProfileId + "/PROJECT/" + projectIndex + "/ROLE/"+ index + "/visibility/" + isVisible;
        ViewProfile profileToReturn = new ViewProfile();
        given(viewProfileService.getByIdAndCheckOwner(viewProfileId, initials)).willReturn(profileToReturn);
        mockMvc.perform(patch(url).accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
        then(viewProfileService).should(times(1)).getByIdAndCheckOwner(viewProfileId, initials);
        then(viewProfileService).should(times(1)).setRoleInProjectEnabled(profileToReturn, projectIndex, index, isVisible);
    }
}