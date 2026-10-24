package de.hbt.config;

import com.sun.net.httpserver.HttpServer;
import de.hbt.client.ConsultantNameClient;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.time.Duration;
import java.util.concurrent.Executors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * A service that hangs ends in a timeout, which the caller handles like a service that can't be reached (#249)
 */
class RestClientTimeoutTest {

    private HttpServer hangingService;

    private final ApplicationContextRunner context = new ApplicationContextRunner()
            .withUserConfiguration(RestClientConfig.class)
            .withPropertyValues("pwr.rest.timeout.read=300ms", "pwr.rest.timeout.slow-read=600ms");

    @BeforeEach
    void startHangingService() throws IOException {
        hangingService = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        hangingService.createContext("/", exchange -> {
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            exchange.close();
        });
        hangingService.setExecutor(Executors.newCachedThreadPool());
        hangingService.start();
    }

    @AfterEach
    void stopHangingService() {
        hangingService.stop(0);
    }

    private String url() {
        return "http://localhost:" + hangingService.getAddress().getPort();
    }

    @Test
    void callsEndAfterTheirReadTimeout() {
        context.run(beans -> {
            assertThat(millisUntilTimeout(beans.getBean(RestTemplate.class))).isBetween(250L, 2000L);
        });
    }

    @Test
    void theDefaultsAreShortForOrdinaryCalls() {
        new ApplicationContextRunner().withUserConfiguration(RestClientConfig.class).run(beans -> {
            RestClientConfig.Timeouts timeouts = beans.getBean(RestClientConfig.Timeouts.class);
            assertThat(timeouts.getConnect()).isEqualTo(Duration.ofSeconds(2));
            assertThat(timeouts.getRead()).isEqualTo(Duration.ofSeconds(10));
        });
    }

    @Test
    void aClientCallingAHangingServiceFailsLikeWithAnUnreachableOne() {
        context.run(beans -> {
            // The name of who exported falls back to the login (#214)
            ConsultantNameClient client = new ConsultantNameClient(beans.getBean(RestTemplate.class));
            ReflectionTestUtils.setField(client, "pwrProfileServiceUrl", url());
            assertThat(client.findFullName("abc")).isEmpty();
        });
    }

    private long millisUntilTimeout(RestTemplate restTemplate) {
        long start = System.nanoTime();
        assertThatThrownBy(() -> restTemplate.getForObject(url() + "/anything", String.class))
                .isInstanceOf(ResourceAccessException.class);
        return (System.nanoTime() - start) / 1_000_000;
    }
}
