package de.hbt.pwr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableRedisRepositories
@EnableAsync
@EnableScheduling
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
