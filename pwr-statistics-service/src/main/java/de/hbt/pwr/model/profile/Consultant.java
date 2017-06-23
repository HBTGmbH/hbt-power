package de.hbt.pwr.model.profile;

import lombok.Data;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDate;

@Data
@RedisHash("Consultant")
public class Consultant {
    private String id;

    private String initials;

    private String firstName;
    private String lastName;
    private String title;

    private LocalDate birthDate;

    private Profile profile;
}
