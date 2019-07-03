package de.hbt.pwr.profile.model.profile;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;


@AllArgsConstructor
@Data
public class BaseProfile {
    private Long id;
    private String description;
    private LocalDateTime lastEdited;
}
