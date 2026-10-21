package de.hbt.pwr.profile.model.check;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Result of the profile check (#139): what is missing or outdated, and when the profile was last changed
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileCheck {

    private String initials;

    @Builder.Default
    private List<ProfileCheckHint> hints = new ArrayList<>();

    /** Last change of any kind */
    private LocalDateTime lastEdited;

    private LocalDateTime skillsLastEdited;

    /** Last save of a project reference */
    private LocalDateTime projectsLastEdited;

    /** Last confirmation without a change */
    private LocalDateTime lastConfirmed;

    /** Whether the unsorted skills could be checked (the skill service answered) */
    private boolean skillTreeChecked;
}
