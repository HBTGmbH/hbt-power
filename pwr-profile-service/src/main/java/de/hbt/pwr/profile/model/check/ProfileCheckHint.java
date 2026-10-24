package de.hbt.pwr.profile.model.check;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * One finding of the profile check (#139). The webclient turns the code and values into a text and links the section
 * (or the project) to the page where it is edited.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileCheckHint {

    public enum Type {
        /** Nothing entered yet */
        MISSING,
        /** Entered, but probably not finished */
        INCOMPLETE,
        /** Not updated for too long; confirming the profile resets this */
        OUTDATED,
        /** Skills the skill tree hasn't sorted yet (category Other) */
        UNSORTED
    }

    public enum Code {
        SECTION_EMPTY,
        DESCRIPTION_MISSING,
        DESCRIPTION_SHORT,
        PROJECT_INCOMPLETE,
        EDUCATION_WITHOUT_DEGREE,
        PROJECTS_OUTDATED,
        NO_FOLLOW_UP_PROJECT,
        RUNNING_PROJECT_OUTDATED,
        SKILLS_OUTDATED,
        SKILLS_UNSORTED
    }

    private Type type;

    private Code code;

    private ProfileSection section;

    /** The project the hint is about, if any */
    private Long projectId;

    private String projectName;

    /** Since when the hint applies, e.g. the last update; null if unknown */
    private LocalDateTime since;

    /** Details of the hint, e.g. counts and thresholds or the names of unsorted skills */
    @Builder.Default
    private Map<String, Object> values = new HashMap<>();
}
