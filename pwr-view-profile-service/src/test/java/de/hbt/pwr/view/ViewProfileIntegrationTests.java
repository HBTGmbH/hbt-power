package de.hbt.pwr.view;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.discovery.converters.Auto;

import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.client.profile.model.Profile;
import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.client.skill.model.SkillServiceSkill;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.service.ViewProfileImporter;
import de.hbt.pwr.view.service.ViewProfileService;
import org.junit.*;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import redis.embedded.RedisServer;

import java.io.IOException;
import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.when;

/**
 *
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles("test")
@TestPropertySource(properties = {"spring.redis.port = " + ViewProfileIntegrationTests.TEST_REDIS_PORT_STRING,})
public class ViewProfileIntegrationTests {


    private static final Integer TEST_REDIS_PORT_INT = 24312;
    static final String TEST_REDIS_PORT_STRING = "24312";

    private static RedisServer redisServer;

    @Autowired
    private ViewProfileImporter viewProfileImporter;

    @Autowired
    private ViewProfileService viewProfileService;

    @MockBean(name = "skillServiceClient")
    private SkillServiceClient skillServiceClient;

    @MockBean
    private ProfileServiceClient profileServiceClient;

    private final String initials = "tst";

    private ViewProfile viewProfile;

    @BeforeClass
    public static void setUpRedis() {
        redisServer = RedisServer.builder()
                .port(TEST_REDIS_PORT_INT)
                //.redisExecProvider(customRedisExec) //com.github.kstyrc (not com.orange.redis-embedded)
                .setting("maxmemory 128M") //maxheap 128M
                .build();

    }

    @Before
    public void startRedis() {
        redisServer.start();
    }


    @After
    public void stopRedis() {
        redisServer.stop();
    }

    private void addTestData() throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
        InputStream profileAsInputStream = this.getClass().getClassLoader().getResourceAsStream("test_profile_1.json");
        Profile profile = objectMapper.readValue(profileAsInputStream, Profile.class);
        given(profileServiceClient.getSingleProfile(initials)).willReturn(profile);
        when(skillServiceClient.getSkillByName(any(String.class)))
                .thenAnswer(invocation -> {
                    String name = invocation.getArgument(0);
                    return new SkillServiceSkill(name);
                });
        viewProfile = viewProfileImporter.importViewProfile(initials);

    }

    @Test
    public void profileIsImportedAndSavedWithoutException() throws IOException {
        addTestData();
        ViewProfile retrieved = viewProfileService.getByIdAndCheckOwner(viewProfile.getId(), initials);
        assertThat(retrieved).isNotNull();
    }
}
