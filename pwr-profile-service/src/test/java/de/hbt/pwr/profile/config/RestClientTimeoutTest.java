package de.hbt.pwr.profile.config;

import com.sun.net.httpserver.HttpServer;
import de.hbt.pwr.profile.client.ReportClient;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
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
public class RestClientTimeoutTest {

    private HttpServer hangingService;

    private final ApplicationContextRunner context = new ApplicationContextRunner()
            .withUserConfiguration(RestClientConfig.class)
            .withPropertyValues("pwr.rest.timeout.read=300ms", "pwr.rest.timeout.slow-read=600ms");

    @Before
    public void startHangingService() throws IOException {
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

    @After
    public void stopHangingService() {
        hangingService.stop(0);
    }

    private String url() {
        return "http://localhost:" + hangingService.getAddress().getPort();
    }

    @Test
    public void callsEndAfterTheirReadTimeout() {
        context.run(beans -> {
            assertThat(millisUntilTimeout(beans.getBean(RestTemplate.class))).isBetween(250L, 2000L);
            assertThat(millisUntilTimeout(beans.getBean(RestClientConfig.SLOW, RestTemplate.class))).isBetween(550L, 2500L);
        });
    }

    @Test
    public void theDefaultsAreShortForOrdinaryCalls() {
        new ApplicationContextRunner().withUserConfiguration(RestClientConfig.class).run(beans -> {
            RestClientConfig.Timeouts timeouts = beans.getBean(RestClientConfig.Timeouts.class);
            assertThat(timeouts.getConnect()).isEqualTo(Duration.ofSeconds(2));
            assertThat(timeouts.getRead()).isEqualTo(Duration.ofSeconds(10));
        });
    }

    @Test
    public void aClientCallingAHangingServiceFailsLikeWithAnUnreachableOne() {
        context.run(beans -> {
            // Deleting a consultant answers 502 when the report service fails (ConsultantService, #240)
            ReportClient client = new ReportClient(beans.getBean(RestTemplate.class));
            ReflectionTestUtils.setField(client, "pwrReportServiceUrl", url());
            assertThatThrownBy(() -> client.deleteAllReports("abc")).isInstanceOf(RestClientException.class);
        });
    }

    private long millisUntilTimeout(RestTemplate restTemplate) {
        long start = System.nanoTime();
        assertThatThrownBy(() -> restTemplate.getForObject(url() + "/anything", String.class))
                .isInstanceOf(ResourceAccessException.class);
        return (System.nanoTime() - start) / 1_000_000;
    }
}
