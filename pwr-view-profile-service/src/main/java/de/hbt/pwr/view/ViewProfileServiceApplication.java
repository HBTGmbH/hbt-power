package de.hbt.pwr.view;

import com.netflix.hystrix.contrib.metrics.eventstream.HystrixMetricsStreamServlet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.netflix.hystrix.EnableHystrix;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import static springfox.documentation.builders.PathSelectors.any;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableCircuitBreaker
@EnableHystrix
@EnableAutoConfiguration(exclude = MongoAutoConfiguration.class)
@EnableSwagger2
@EnableAspectJAutoProxy // Enables AspectJ style annotations
@EnableRedisRepositories
public class ViewProfileServiceApplication {

    private final RedisConnectionFactory redisConnectionFactory;

    @Autowired
    public ViewProfileServiceApplication(RedisConnectionFactory redisConnectionFactory) {
        this.redisConnectionFactory = redisConnectionFactory;
    }


    /**
     * Exposes the hystrix metrics
     */
    @Bean
    public ServletRegistrationBean servletRegistrationBean(){
        return new ServletRegistrationBean<>(new HystrixMetricsStreamServlet(),"/hystrix.stream");
    }

    @Bean
    public RedisTemplate<?, ?> redisTemplate() {
        RedisTemplate<byte[],byte[]> res = new RedisTemplate<>();
        res.setConnectionFactory(redisConnectionFactory);
        res.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        res.setDefaultSerializer(new GenericJackson2JsonRedisSerializer());
        return res;
    }

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("de.hbt.pwr"))
                .paths(any())
                .build();
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("HBT Power View Profile Service")
                .description("Service that generates momentary snapshots of a consultant profile to provide various methods to structure the unstructured data.")
                .contact(new Contact("Niklas Thilmont", "hbt.de", "nt@hbt.de"))
                .version("1.0")
                .build();
    }

    public static void main(String[] args) {
		SpringApplication.run(ViewProfileServiceApplication.class, args); //NOSONAR
	}
}
