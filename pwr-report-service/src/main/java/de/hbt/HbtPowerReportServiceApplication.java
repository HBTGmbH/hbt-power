package de.hbt;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.scheduling.annotation.EnableAsync;


@SpringBootApplication(exclude = {MongoAutoConfiguration.class})
@EnableAsync
public class HbtPowerReportServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(HbtPowerReportServiceApplication.class, args);
    }
}
