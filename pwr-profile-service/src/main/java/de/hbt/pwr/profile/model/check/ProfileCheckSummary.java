package de.hbt.pwr.profile.model.check;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * One row of the admins' consultant list (#139): how up to date a profile is
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileCheckSummary {

    private String initials;

    private String name;

    private int hintCount;

    private int outdatedCount;

    private LocalDateTime lastEdited;

    private LocalDateTime lastConfirmed;

    /** How often the profile was only confirmed since its last change */
    private int confirmationsSinceLastChange;
}
