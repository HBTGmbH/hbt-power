package de.hbt.pwr.profile.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class ConsultantDTO {
    private String initials;
    private String firstName;
    private String lastName;
    private String title;
    private boolean active;
    private LocalDate birthDate;
    private String profilePictureId;
    private Long profileId;
    private LocalDateTime profileLastUpdated;
}
