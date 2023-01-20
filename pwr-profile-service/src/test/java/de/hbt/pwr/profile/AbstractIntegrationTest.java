package de.hbt.pwr.profile;

import de.hbt.pwr.profile.client.SkillProfileClient;
import de.hbt.pwr.profile.client.ViewProfileClient;
import de.hbt.pwr.profile.model.skill.SkillCategory;
import org.junit.Before;
import org.mockito.Mockito;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseEntity;

import static org.mockito.ArgumentMatchers.any;

public class AbstractIntegrationTest {
    @MockBean(name = "skillProfileClient")
    protected SkillProfileClient skillProfileClient;

    @MockBean(name = "viewProfileClient")
    protected ViewProfileClient viewProfileClient;

    @Before
    public void setUp() throws Exception {
    }
}
