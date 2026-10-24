package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.client.files.FileUploadClient;
import de.hbt.pwr.view.client.profile.ProfileServiceClient;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.ViewProfileInfo;
import de.hbt.pwr.view.repo.ReportTemplateRepository;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
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
import org.springframework.web.client.ResourceAccessException;
import redis.embedded.RedisServer;

import java.io.IOException;
import java.util.Set;

import static de.hbt.pwr.view.service.housekeeping.HousekeepingService.TEMPLATES_WITHOUT_FILE;
import static de.hbt.pwr.view.service.housekeeping.HousekeepingService.VIEW_PROFILES_WITHOUT_CONSULTANT;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The view-profile service finds and deletes its own left-overs (#242): view profiles of consultants that are gone and
 * templates without their file. It only reads from the other services.
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {"spring.redis.port = " + HousekeepingAdminControllerITest.TEST_REDIS_PORT_STRING})
public class HousekeepingAdminControllerITest {

    static final String TEST_REDIS_PORT_STRING = "24314";

    private static RedisServer redisServer;

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ViewProfileRepository viewProfileRepository;
    @Autowired
    private ReportTemplateRepository reportTemplateRepository;
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

    @Before
    public void setUp() {
        viewProfileRepository.save(viewProfile("vp-kept", "tes", "Behalten"));
        viewProfileRepository.save(viewProfile("vp-gone", "alt", "Vom Gelöschten"));
        viewProfileRepository.save(viewProfile("vp-ownerless", "", "Ohne Besitzer"));
        reportTemplateRepository.save(ReportTemplate.builder().id("t-kept").name("Standard").fileId("f1").previewId("").build());
        reportTemplateRepository.save(ReportTemplate.builder().id("t-gone").name("Ohne Datei").fileId("f-gone").previewId("p1").build());
        given(profileServiceClient.findAllInitials()).willReturn(Set.of("tes"));
        given(fileUploadClient.findAllFileIds()).willReturn(Set.of("f1", "p1"));
    }

    @After
    public void tearDown() {
        viewProfileRepository.deleteAll();
        reportTemplateRepository.deleteAll();
    }

    private static ViewProfile viewProfile(String id, String owner, String name) {
        ViewProfileInfo info = new ViewProfileInfo();
        info.setOwnerInitials(owner);
        info.setName(name);
        ViewProfile viewProfile = new ViewProfile();
        viewProfile.setId(id);
        viewProfile.setViewProfileInfo(info);
        return viewProfile;
    }

    @Test
    public void findsViewProfilesWithoutConsultantAndTemplatesWithoutFile() throws Exception {
        mockMvc.perform(get("/admin/housekeeping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].check").value(VIEW_PROFILES_WITHOUT_CONSULTANT))
                .andExpect(jsonPath("$[0].count").value(2))
                .andExpect(jsonPath("$[0].examples", containsInAnyOrder("alt: Vom Gelöschten", "?: Ohne Besitzer")))
                .andExpect(jsonPath("$[1].check").value(TEMPLATES_WITHOUT_FILE))
                .andExpect(jsonPath("$[1].count").value(1))
                .andExpect(jsonPath("$[1].examples[0]").value("Ohne Datei (t-gone)"));
    }

    @Test
    public void cleaningDeletesOnlyTheLeftOvers() throws Exception {
        mockMvc.perform(delete("/admin/housekeeping/" + VIEW_PROFILES_WITHOUT_CONSULTANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2));
        mockMvc.perform(delete("/admin/housekeeping/" + TEMPLATES_WITHOUT_FILE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));

        assertThat(viewProfileRepository.findAll()).extracting(ViewProfile::getId).containsExactly("vp-kept");
        assertThat(reportTemplateRepository.findAll()).extracting(ReportTemplate::getId).containsExactly("t-kept");
    }

    @Test
    public void ifTheProfileServiceFails_theCheckReportsIt_andNothingIsDeleted() throws Exception {
        given(profileServiceClient.findAllInitials()).willThrow(new ResourceAccessException("Connection refused"));

        mockMvc.perform(get("/admin/housekeeping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].error", containsString("Connection refused")))
                .andExpect(jsonPath("$[0].count").value(0))
                .andExpect(jsonPath("$[1].count").value(1));
        mockMvc.perform(delete("/admin/housekeeping/" + VIEW_PROFILES_WITHOUT_CONSULTANT))
                .andExpect(status().isServiceUnavailable());

        assertThat(viewProfileRepository.count()).isEqualTo(3);
    }

    @Test
    public void anEmptyListOfConsultants_neverMakesEveryViewProfileALeftOver() throws Exception {
        given(profileServiceClient.findAllInitials()).willReturn(Set.of());

        mockMvc.perform(get("/admin/housekeeping"))
                .andExpect(jsonPath("$[0].error", startsWith("Another service did not answer")));
        mockMvc.perform(delete("/admin/housekeeping/" + VIEW_PROFILES_WITHOUT_CONSULTANT))
                .andExpect(status().isServiceUnavailable());

        assertThat(viewProfileRepository.count()).isEqualTo(3);
    }

    @Test
    public void ifTheReportServiceFails_noTemplateIsDeleted() throws Exception {
        given(fileUploadClient.findAllFileIds()).willThrow(new ResourceAccessException("Connection refused"));

        mockMvc.perform(get("/admin/housekeeping"))
                .andExpect(jsonPath("$[1].error", containsString("Connection refused")));
        mockMvc.perform(delete("/admin/housekeeping/" + TEMPLATES_WITHOUT_FILE))
                .andExpect(status().isServiceUnavailable());

        assertThat(reportTemplateRepository.count()).isEqualTo(2);
    }

    @Test
    public void listsTheFilesTheTemplatesPointTo() throws Exception {
        mockMvc.perform(get("/admin/template/files"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", containsInAnyOrder("f1", "f-gone", "p1")));
    }

    @Test
    public void anUnknownCheck_isNotFound() throws Exception {
        mockMvc.perform(delete("/admin/housekeeping/unknown")).andExpect(status().isNotFound());
    }
}
