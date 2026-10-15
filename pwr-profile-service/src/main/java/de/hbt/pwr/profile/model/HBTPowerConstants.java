package de.hbt.pwr.profile.model;


import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.Project;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class HBTPowerConstants {
    /**
     * The maximum amount of {@link Project#projectRoles} that are allowed within a project.
     */
    public static final int MAX_ROLES_PER_PROJECT = 3;

    /**
     * The maximum amount of characters allowed in the {@link Profile#description} string.
     * DO NOT CHANGE WITHOUT CHANGING THE DATABASE ENTRY
     */
    public static final int PROFILE_DESCRIPTION_LENGTH = 4000;


    private static Integer DEFAULT_CHARS_PER_LINE;

    public static Integer getDefaultCharsPerLine() {
        return DEFAULT_CHARS_PER_LINE;
    }

    @Value("${default-chars-per-line}")
    public synchronized void setDefaultCharsPerLine(Integer value) {
        DEFAULT_CHARS_PER_LINE = value;
    }

}
