package de.hbt.pwr.profile.controller;

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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest
@ActiveProfiles("test")
public class ProfileEntryEndpointITest {

    @Autowired
    ProfileEntryEndpoint endpoint;

    @Autowired
    ProfileRepository profileRepository;
    @Autowired
    ConsultantRepository consultantRepository;
    @Autowired
    ConsultantService consultantService;

    private Consultant testConsultant;

    @Before
    public void setup() {
        testConsultant = consultantService.createNewConsultant("abc", "a", "b", "", LocalDate.now());

    }

    @After
    public void tearDown() throws Exception {
        testConsultant.setActive(false);
        consultantService.updatePersonalData("abc",testConsultant);
        consultantService.deleteConsultant("abc");
    }

    @Test
    public void createProfileForConsultant() {
        Profile p = consultantService.getProfileByInitials("abc");
        assertThat(p.getId()).isNotNull();

    }


    @Test
    public void saveSkillInProfile(){
        Skill s = Skill.builder().id(null).name("skilli").rating(3).build();

        s = endpoint.updateSkill("abc",s);
        Profile p = consultantService.getProfileByInitials("abc");
        assertThat(p.getSkills().size()).isEqualTo(1);
        assertThat(p.getSkills()).contains(s);
    }


    @Test
    public void saveProjectToProfile(){
        Project project = new Project();


        project = endpoint.updateProject("abc",project);
        Profile p = consultantService.getProfileByInitials("abc");
        assertThat(p.getProjects()).hasSize(1);
        assertThat(p.getProjects()).usingFieldByFieldElementComparator().contains(project);
    }




}