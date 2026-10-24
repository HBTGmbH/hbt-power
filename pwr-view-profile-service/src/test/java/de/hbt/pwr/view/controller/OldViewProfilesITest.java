package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.client.files.FileUploadClient;
import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.ViewProfileInfo;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import de.hbt.pwr.view.service.ViewProfileOperationService;
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

import static de.hbt.pwr.view.service.housekeeping.OldViewProfilesService.OLD_VIEW_PROFILES;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Housekeeping, rubric old (#289): view profiles not changed and not exported for longer than the limit (730 days by
 * default), the most recently used of each consultant excepted
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {"spring.redis.port = " + OldViewProfilesITest.TEST_REDIS_PORT_STRING})
public class OldViewProfilesITest {

    static final String TEST_REDIS_PORT_STRING = "24315";

    private static final LocalDate THREE_YEARS_AGO = LocalDate.now().minusYears(3);

    private static RedisServer redisServer;

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ViewProfileRepository viewProfileRepository;
    @Autowired
    private ViewProfileOperationService viewProfileOperationService;
    @MockBean
    private ProfileServiceClient profileServiceClient;
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

    private ViewProfile viewProfile(String id, String owner, String name, LocalDate created, LocalDate lastUsed) {
        ViewProfileInfo info = new ViewProfileInfo();
        info.setOwnerInitials(owner);
        info.setName(name);
        info.setCreationDate(created);
        info.setLastUsed(lastUsed);
        ViewProfile viewProfile = new ViewProfile();
        viewProfile.setId(id);
        viewProfile.setViewProfileInfo(info);
        return viewProfileRepository.save(viewProfile);
    }

    @Test
    public void oldViewProfiles_areFoundAndDeleted_theMostRecentlyUsedOfEachConsultantStays() throws Exception {
        viewProfile("tes-old", "tes", "Alt", THREE_YEARS_AGO, THREE_YEARS_AGO);
        viewProfile("tes-older", "tes", "Älter", THREE_YEARS_AGO.minusYears(1), null);
        viewProfile("tes-exported", "tes", "Angelegt vor Jahren, kürzlich exportiert", THREE_YEARS_AGO, LocalDate.now().minusDays(7));
        viewProfile("kai-1", "kai", "Kai alt", THREE_YEARS_AGO, THREE_YEARS_AGO);
        viewProfile("kai-2", "kai", "Kai jüngstes", THREE_YEARS_AGO, THREE_YEARS_AGO.plusDays(10));
        viewProfile("ole-1", "ole", "Ole einziges", THREE_YEARS_AGO, THREE_YEARS_AGO);
        // From before #289: no lastUsed, created long ago; counts as used when tracking started
        viewProfile("tes-legacy", "tes", "Ohne lastUsed", LocalDate.now().minusYears(5), null);

        mockMvc.perform(get("/admin/housekeeping/old"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].check").value(OLD_VIEW_PROFILES))
                .andExpect(jsonPath("$[0].count").value(2))
                .andExpect(jsonPath("$[0].examples", contains("kai: Kai alt (" + THREE_YEARS_AGO + ")",
                        "tes: Alt (" + THREE_YEARS_AGO + ")")));

        mockMvc.perform(delete("/admin/housekeeping/old/" + OLD_VIEW_PROFILES))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2));
        assertThat(viewProfileRepository.findAll()).extracting(ViewProfile::getId)
                .containsExactlyInAnyOrder("tes-older", "tes-exported", "kai-2", "ole-1", "tes-legacy");
    }

    @Test
    public void changingOrExporting_marksTheViewProfileAsUsedToday() {
        ViewProfile viewProfile = viewProfile("tes-old", "tes", "Alt", THREE_YEARS_AGO, THREE_YEARS_AGO);

        viewProfileOperationService.markExported(viewProfile);

        assertThat(viewProfileRepository.findById("tes-old")).get()
                .extracting(saved -> saved.getViewProfileInfo().getLastUsed()).isEqualTo(LocalDate.now());
    }

    @Test
    public void anUnknownCheck_isNotFound_andOnlyAdminsGetThere() throws Exception {
        mockMvc.perform(delete("/admin/housekeeping/old/everything"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/admin/housekeeping/old").header("X-Pwr-User-Admin", "false"))
                .andExpect(status().isForbidden());
    }
}
