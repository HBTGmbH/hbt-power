package de.hbt.pwr.view;

import de.hbt.pwr.view.controller.ReportTemplateController;
import de.hbt.pwr.view.controller.ViewProfileController;
import de.hbt.pwr.view.exception.TemplateNotFoundException;
import de.hbt.pwr.view.model.ReportTemplate;
import de.hbt.pwr.view.repo.ReportTemplateRepository;
import de.hbt.pwr.view.service.ReportTemplateService;
import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import redis.embedded.RedisServer;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 *
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles("test")
@TestPropertySource(properties = {"spring.redis.port = " + ReportTemplateServiceIntegrationTest.TEST_REDIS_PORT_STRING,})
public class ReportTemplateServiceIntegrationTest {


    private static final Integer TEST_REDIS_PORT_INT = 24312;
    static final String TEST_REDIS_PORT_STRING = "24312";

    private static RedisServer redisServer;

    @Autowired
    private ViewProfileController viewProfileController;

    @Autowired
    private ReportTemplateController reportTemplateController;

    @Autowired
    private ReportTemplateService reportTemplateService;

    @Autowired
    private ReportTemplateRepository reportTemplateRepository;

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

    @Test
    public void shouldAddTemplateAndGetItBack() throws Exception {
        ReportTemplate expected = ReportTemplate.builder().id("111").name("No1.").description("template 1").build();
        reportTemplateRepository.save(expected);

        ReportTemplate reportTemplate = reportTemplateService.getTemplate("111");

        assertThat(reportTemplate).isEqualTo(expected);
    }

    @Test(expected = TemplateNotFoundException.class)
    public void shouldDeleteTemplateAndThrowExceptionGettingIt() throws Exception {
        reportTemplateRepository.save(ReportTemplate.builder().id("222").name("No.2").description("template 2").build());
        reportTemplateRepository.deleteById("222");

        ReportTemplate reportTemplate = reportTemplateService.getTemplate("222");
        assertThat(reportTemplate).isNull();
    }

    @Test
    public void shouldAddTwoAndDeleteTheFirst() throws Exception {
        reportTemplateRepository.save(ReportTemplate.builder().id("111").name("No.1").description("template 1").build());
        reportTemplateRepository.save(ReportTemplate.builder().id("222").name("No.2").description("template 2").build());

        reportTemplateRepository.deleteById("111");
        ReportTemplate reportTemplate = reportTemplateService.getTemplate("222");
        assertThat(reportTemplate).isNotNull();
        assertThat(reportTemplateRepository.count()).isEqualTo(1);

    }

    @Test
    public void shouldAddTwoAndGetIds() throws Exception {
        String id1 = "111";
        String id2 = "222";
        reportTemplateRepository.save(ReportTemplate.builder().id(id1).name("No.1").description("template 1").build());
        reportTemplateRepository.save(ReportTemplate.builder().id(id2).name("No.2").description("template 2").build());


        List<String> result = reportTemplateService.getTemplateIds();
        assertThat(result).contains(id1);
        assertThat(result).contains(id2);

    }

    @Test
    public void addViaAPI() throws Exception {
        String id;

        String name = "No.1";
        String description = "template1";
        String path = "a/a/a";
        String user = "tst";

        ReportTemplate.ReportTemplateShort info = new ReportTemplate.ReportTemplateShort();
        info.createUser = user;
        info.description = description;
        info.path = path;

        ResponseEntity<ReportTemplate> response = reportTemplateController.createTemplate(name, info);
        String r_name = response.getBody().getName();
        String r_description = response.getBody().getDescription();
        String r_path = response.getBody().getPath();
        String r_user = response.getBody().getCreateUser();

        id = response.getBody().getId();

        ReportTemplate template = reportTemplateService.getTemplate(id);

        assertThat(r_name).isEqualTo(name).isEqualTo(template.getName());
        assertThat(r_description).isEqualTo(description).isEqualTo(template.getDescription());
        assertThat(r_path).isEqualTo(path).isEqualTo(template.getPath());
        assertThat(r_user).isEqualTo(user).isEqualTo(template.getCreateUser());
    }

    @Test
    public void getViaAPI() throws Exception {
        String name = "No.1";
        String description = "template1";
        String path = "a/a/a";
        String user = "tst";
        ReportTemplate.ReportTemplateShort info = new ReportTemplate.ReportTemplateShort();
        info.createUser = user;
        info.description = description;
        info.path = path;

        ResponseEntity<ReportTemplate> response1 = reportTemplateController.createTemplate(name, info);

        name = "No.2";
        description = "template2";
        path = "b/b/b";
        user = "oth";
        info = new ReportTemplate.ReportTemplateShort();
        info.createUser = user;
        info.description = description;
        info.path = path;

        ResponseEntity<ReportTemplate> response2 = reportTemplateController.createTemplate(name, info);

        List<String> result = reportTemplateService.getTemplateIds();

        ReportTemplate template2 = reportTemplateService.getTemplate(response2.getBody().getId());


        assertThat(template2.getName()).isEqualTo(name);

        assertThat(result).contains(response1.getBody().getId());
        assertThat(result).contains(response2.getBody().getId());

    }


}
