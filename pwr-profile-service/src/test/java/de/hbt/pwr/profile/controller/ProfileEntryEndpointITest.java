package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.data.ProfileRepository;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.service.ConsultantService;
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
        testConsultant = consultantRepository.findByInitials("abc")
                .orElseGet(() -> consultantService.createNewConsultant("abc", "a", "b", "", LocalDate.now()));

    }

    @Test
    public void createProfileForConsultant() {
        Profile p = consultantService.getProfileByInitials("abc");
        assertThat(p.getId()).isNotNull();

    }




}