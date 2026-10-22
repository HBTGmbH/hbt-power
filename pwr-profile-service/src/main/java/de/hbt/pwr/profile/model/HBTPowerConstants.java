package de.hbt.pwr.profile.model;


import de.hbt.pwr.profile.model.profile.Profile;
import de.hbt.pwr.profile.model.profile.entries.Project;
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

    /**
     * As in the production database, which already has varchar(4000); without it Hibernate creates varchar(255) (#141)
     */
    public static final int PROJECT_DESCRIPTION_LENGTH = 4000;

}
