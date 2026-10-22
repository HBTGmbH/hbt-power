package de.hbt.pwr.view;

import de.hbt.pwr.view.controller.ViewProfileController;
import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.model.ViewProfileInfo;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import redis.embedded.RedisServer;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A field removed from the model stays in the hashes of view profiles stored before (#179: charsPerLine). Spring Data
 * Redis passes over it when reading and drops it with the next save, so removing a field needs no migration.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles("test")
@TestPropertySource(properties = {"spring.redis.port = " + ViewProfileRemovedFieldIntegrationTest.TEST_REDIS_PORT_STRING})
public class ViewProfileRemovedFieldIntegrationTest {

    private static final Integer TEST_REDIS_PORT_INT = 24313;
    static final String TEST_REDIS_PORT_STRING = "24313";

    private static final String REMOVED_FIELD = "viewProfileInfo.charsPerLine";

    private static RedisServer redisServer;

    @Autowired
    private ViewProfileController viewProfileController;

    @Autowired
    private ViewProfileRepository viewProfileRepository;

    @Autowired
    private RedisConnectionFactory redisConnectionFactory;

    private StringRedisTemplate redis;

    @BeforeClass
    public static void setUpRedis() throws IOException {
        redisServer = RedisServer.newRedisServer()
                .port(TEST_REDIS_PORT_INT)
                .setting("maxmemory 128M")
                .build();
    }

    @Before
    public void startRedis() throws IOException {
        redisServer.start();
        redis = new StringRedisTemplate(redisConnectionFactory);
    }

    @After
    public void stopRedis() throws IOException {
        redisServer.stop();
    }

    /** A view profile as stored before #179, with the entry of the removed field in its hash */
    private String storedWithRemovedField() {
        // Constructors, not the builders: they leave out the defaults (empty lists and texts)
        ViewProfile viewProfile = new ViewProfile();
        viewProfile.setId("vp-179");
        viewProfile.getViewProfileInfo().setOwnerInitials("tst");
        viewProfile.getViewProfileInfo().setName("Ausschreibung");
        viewProfile = viewProfileRepository.save(viewProfile);
        redis.opsForHash().put("viewProfile:" + viewProfile.getId(), REMOVED_FIELD, "45");
        assertThat(redis.opsForHash().hasKey("viewProfile:" + viewProfile.getId(), REMOVED_FIELD)).isTrue();
        return viewProfile.getId();
    }

    @Test
    public void viewProfileWithRemovedField_isReadAndTheEntryGoesWithTheNextSave() {
        String id = storedWithRemovedField();

        ViewProfile read = viewProfileController.getViewProfile("tst", id).getBody();
        assertThat(read).isNotNull();
        assertThat(read.getViewProfileInfo().getName()).isEqualTo("Ausschreibung");

        ViewProfileInfo update = new ViewProfileInfo();
        update.setName("Ausschreibung Behörde");
        viewProfileController.partiallyUpdateInfo(update, "tst", id);

        assertThat(viewProfileRepository.findById(id).get().getViewProfileInfo().getName()).isEqualTo("Ausschreibung Behörde");
        assertThat(redis.opsForHash().hasKey("viewProfile:" + id, REMOVED_FIELD)).isFalse();
    }
}
