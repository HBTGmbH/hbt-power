package de.hbt.pwr.profile.model.notification;

import de.hbt.pwr.profile.model.profile.entries.NameEntity;

/**
 * Created by nt on 30.05.2017.
 */
public enum AdminNotificationReason {
    /**
     * A {@link de.hbt.pwr.profile.model.profile.Profile} has been updated.
     */
    PROFILE_UPDATED,
    /**
     * A new {@link NameEntity} that previously was unknown
     * has been added.
     */
    NAME_ENTITY_ADDED,

    /**
     * A new dangerous Skill has been added.
     * Claimed as dangerous, because it was not known before that
     */
    DANGEROUS_SKILL_ADDED_UNKNOWN,

    /**
     * A new dangerous Skill has been added.
     * Claimed as dangerous, because its blacklisted
     */
    DANGEROUS_SKILL_ADDED_BLACKLISTED

}
