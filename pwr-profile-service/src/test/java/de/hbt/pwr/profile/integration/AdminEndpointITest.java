package de.hbt.pwr.profile.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.hbt.pwr.profile.AbstractIntegrationTest;
import de.hbt.pwr.profile.client.SkillProfileClient;
import de.hbt.pwr.profile.controller.AdminEndpoint;
import de.hbt.pwr.profile.model.Skill;
import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.Project;
import de.hbt.pwr.profile.service.ProfileUpdateService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import java.io.InputStream;

import static org.assertj.core.api.Java6Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class AdminEndpointITest extends AbstractIntegrationTest {

    private Profile sampleProfile;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private AdminEndpoint adminEndpoint;

    @Autowired
    private ProfileUpdateService profileUpdateService;

    @Before
    public void setUp() throws Exception {
        InputStream streamedProfileData = AdminEndpointITest.class.getClassLoader().getResourceAsStream("./sample-profile.json");
        ObjectMapper om = new ObjectMapper().findAndRegisterModules();
        sampleProfile = om.readValue(streamedProfileData, Profile.class);
        sampleProfile = profileUpdateService.updateProfile(sampleProfile);
        entityManager.flush();
    }

    /**
     * Regressiontest for PWR-162
     */
    @Test
    public void whenRenamingASkillInAllProfiles_shouldPersistAllChanges() {
        adminEndpoint.renameSkillInAllProfiles("Warp", "Warp-Drive Development");
        entityManager.flush();
        Profile retrievedProfile = entityManager.find(Profile.class, sampleProfile.getId());
        assertThat(retrievedProfile.getSkills())
                .extracting(Skill::getName)
                .doesNotContain("Warp");
        assertThat(retrievedProfile.getProjects())
                .flatExtracting(Project::getSkills)
                .extracting(Skill::getName)
                .doesNotContain("Warp");
    }
}
