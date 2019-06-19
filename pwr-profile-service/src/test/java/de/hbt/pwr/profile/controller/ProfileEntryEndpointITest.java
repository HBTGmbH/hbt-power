package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.Project;
import de.hbt.pwr.profile.service.ConsultantService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.time.LocalDate;
import java.util.HashSet;

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


    @Test
    public void createProfileForConsultant() {
        Consultant c = consultantService.createNewConsultant("abc", "a", "b", "", LocalDate.now());
        Profile p = consultantService.getProfileByInitials("abc");
        assertThat(p.getId()).isNotNull();

    }

    @Test
    public void changeProfileInConsultant() {
        Consultant c = consultantService.createNewConsultant("abc", "a", "b", "", LocalDate.now());
        Profile p = consultantService.getProfileByInitials("abc");
        assertThat(p.getId()).isNotNull();
        Skill skill = Skill.builder().id(null).name("skill").rating(3).build();
        skill = endpoint.updateSkill("abc", skill);
        p = consultantService.getProfileByInitials("abc");
        assertThat(skill.getId()).isNotNull();
        assertThat(c.getProfile().getSkills()).contains(skill);
        assertThat(p.getSkills().size()).isEqualTo(1);
    }

    @Test
    public void updateProject() {
        Consultant c = consultantService.createNewConsultant("abc", "a", "b", "", LocalDate.now());

        Project project = Project.builder().skills(new HashSet<>()).build();
        Skill s1 = Skill.builder().id(null).name("S1").rating(3).build();
        Skill s2 = Skill.builder().id(11L).name("S2").rating(4).build();
        project.getSkills().add(s1);
        project.getSkills().add(s2);

        project = endpoint.updateProject("abc", project);
        Profile p = consultantService.getProfileByInitials("abc");
        assertThat(p.getProjects().size()).isEqualTo(1);
        assertThat(p.getProjects().iterator().next().getSkills()).contains(s1, s2);
        assertThat(project.getId()).isNotNull();
    }

    @Test
    public void deleteProject() {
    }
}