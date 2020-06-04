package de.hbt.pwr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.netflix.feign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication // Spring application config
@EnableRedisRepositories // Reids repositories to easily manage redis
@EnableDiscoveryClient // Eureka Service discovery client
@EnableFeignClients // Want to use feign clients to communicate with the profile service in a declarative way
@EnableAsync // Async tasks
@EnableScheduling // There are regular scheduled tasks
@EnableCircuitBreaker
public class StatisticsApplication {

    @Bean
    public RedisTemplate<?, ?> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<byte[],byte[]> res = new RedisTemplate<>();
        res.setConnectionFactory(redisConnectionFactory);
        return res;
    }

    public static void main(String[] args) {
		SpringApplication.run(StatisticsApplication.class, args);
	}
}
