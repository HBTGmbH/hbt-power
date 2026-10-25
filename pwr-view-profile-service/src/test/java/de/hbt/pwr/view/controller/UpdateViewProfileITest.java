package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.client.files.FileUploadClient;
import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.client.profile.model.Profile;
import de.hbt.pwr.view.client.skill.SkillServiceClient;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.ViewProfileInfo;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import redis.embedded.RedisServer;

import java.io.IOException;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Updating a view profile changes it in place (#332), with the real auto save (ViewProfileAutoSaveAspect): the view
 * profile being built is sorted, which must not store it as a second one
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {"spring.redis.port = " + UpdateViewProfileITest.TEST_REDIS_PORT_STRING})
public class UpdateViewProfileITest {

    static final String TEST_REDIS_PORT_STRING = "24316";

    private static RedisServer redisServer;

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ViewProfileRepository viewProfileRepository;
    @MockBean
    private ProfileServiceClient profileServiceClient;
    @MockBean
    private SkillServiceClient skillServiceClient;
    @MockBean
    private FileUploadClient fileUploadClient;

    @BeforeClass
    public static void startRedis() throws IOException {
        redisServer = RedisServer.newRedisServer().port(Integer.parseInt(TEST_REDIS_PORT_STRING))
                .setting("maxmemory 128M").build();
        redisServer.start();
    }

    @AfterClass
    public static void stopRedis() throws IOException {
        redisServer.stop();
    }

    @After
    public void tearDown() {
        viewProfileRepository.deleteAll();
    }

    @Test
    public void updating_keepsTheViewProfileAndCreatesNoOther() throws Exception {
        ViewProfile old = new ViewProfile();
        old.setId("vp1");
        old.setViewProfileInfo(ViewProfileInfo.builder().ownerInitials("tst").name("Für Kunde X").viewDescription("Notiz")
                .consultantName("").creationDate(LocalDate.of(2024, 3, 1)).build());
        old.setDescription("Alter Werbetext");
        viewProfileRepository.save(old);
        Profile profile = new Profile();
        profile.setDescription("Neuer Werbetext");
        given(profileServiceClient.getSingleProfile("tst")).willReturn(profile);

        mockMvc.perform(post("/view/update/tst/vp1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("vp1"))
                .andExpect(jsonPath("$.viewProfileInfo.name").value("Für Kunde X"))
                .andExpect(jsonPath("$.viewProfileInfo.viewDescription").value("Notiz"))
                .andExpect(jsonPath("$.viewProfileInfo.creationDate").value("2024-03-01"));

        assertThat(viewProfileRepository.findAll()).extracting(ViewProfile::getId).containsExactly("vp1");
        assertThat(viewProfileRepository.findById("vp1")).get().extracting(ViewProfile::getDescription)
                .isEqualTo("Neuer Werbetext");
    }
}
