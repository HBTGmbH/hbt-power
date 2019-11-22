package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.client.ViewProfileClient;
import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.Project;
import de.hbt.pwr.profile.service.ConsultantService;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest
@ActiveProfiles("test")
public class ProfileEntryEndpointITest {

    @MockBean
    ViewProfileClient viewProfileClient;

    @Autowired
    ProfileEntryEndpoint endpoint;
    @Autowired
    ProfileRepository profileRepository;
    @Autowired
    ConsultantRepository consultantRepository;
    @Autowired
    @InjectMocks
    ConsultantService consultantService;
    private Consultant testConsultant;

    private void setUpFeignClient() {
        when(viewProfileClient.getAllViewProfiles(any())).thenAnswer(invocationOnMock ->  ResponseEntity.ok(new ArrayList<String>()));
    }

    @Before
    public void setup() {

        testConsultant = consultantService.createNewConsultant("abc", "a", "b", "", LocalDate.now());
    }

    @After
    public void tearDown() throws Exception {
        setUpFeignClient();
        testConsultant.setActive(false);
        consultantService.updatePersonalData("abc", testConsultant);
        consultantService.deleteConsultant("abc");
    }

    @Test
    public void createProfileForConsultant() {
        Profile p = consultantService.getProfileByInitials("abc");
        assertThat(p.getId()).isNotNull();
    }

    @Test
    public void saveSkillInProfile() {
        Skill s = Skill.builder().id(null).name("skilli").rating(3).versions(new HashSet<>()).build();

        s = endpoint.updateSkill("abc", s);
        Profile p = consultantService.getProfileByInitials("abc");
        assertThat(p.getSkills().size()).isEqualTo(1);
        assertThat(p.getSkills()).contains(s);
    }

    @Test
    public void saveProjectToProfile() {
        Project project = new Project();

        project = endpoint.updateProject("abc", project);
        Profile p = consultantService.getProfileByInitials("abc");
        assertThat(p.getProjects()).hasSize(1);
        assertThat(p.getProjects()).usingFieldByFieldElementComparator().contains(project);
    }


}
