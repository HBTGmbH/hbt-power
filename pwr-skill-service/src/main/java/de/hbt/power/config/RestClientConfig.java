package de.hbt.power.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * The RestTemplates for the calls to other services (#249). Every call has a connect and a read timeout, so a service
 * that hangs doesn't hold the threads of the caller; a timeout throws a RestClientException like a service that
 * can't be reached, and the existing handling of that applies. The values are properties
 * (<code>pwr.rest.timeout.*</code>), so the deployment can change them without a build.
 * <p>
 * Same request factory and message converters as a plain <code>new RestTemplate()</code>, so what goes over the wire
 * stays as it was; only the timeouts are new.
 */
@Configuration
@EnableConfigurationProperties(RestClientConfig.Timeouts.class)
public class RestClientConfig {

    @Bean
    public RestTemplate restTemplate(Timeouts timeouts) {
        return restTemplate(timeouts.getConnect(), timeouts.getRead());
    }

    static RestTemplate restTemplate(Duration connect, Duration read) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) connect.toMillis());
        requestFactory.setReadTimeout((int) read.toMillis());
        return new RestTemplate(requestFactory);
    }

    @ConfigurationProperties("pwr.rest.timeout")
    public static class Timeouts {

        /**
         * Until the connection to the other service stands
         */
        private Duration connect = Duration.ofSeconds(2);

        /**
         * Until the answer of an ordinary call
         */
        private Duration read = Duration.ofSeconds(10);

        public Duration getConnect() {
            return connect;
        }

        public void setConnect(Duration connect) {
            this.connect = connect;
        }

        public Duration getRead() {
            return read;
        }

        public void setRead(Duration read) {
            this.read = read;
        }
    }
}
