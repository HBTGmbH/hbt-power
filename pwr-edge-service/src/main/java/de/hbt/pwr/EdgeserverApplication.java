package de.hbt.pwr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;

/**
 * Serves as cartridge for the zuul proxy server that communicates with an eureka discovery server to create dynamic
 * routings.
 */
@SpringBootApplication
@EnableZuulProxy
@EnableDiscoveryClient
public class EdgeserverApplication {

	public static void main(String[] args) {
		SpringApplication.run(EdgeserverApplication.class, args);
	}
}
