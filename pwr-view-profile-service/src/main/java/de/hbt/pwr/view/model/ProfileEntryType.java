package de.hbt.pwr.view.model;

/**
 * @author nt / nt@hbt.de
 * @since 28.08.2017
 */
public enum ProfileEntryType {
    /**
     * {@link de.hbt.pwr.view.model.entries.Career}
     */
    CAREER,

    /**
     * {@link de.hbt.pwr.view.model.entries.Education}
     */
    EDUCATION,

    /**
     * {@link de.hbt.pwr.view.model.entries.KeySkill}
     */
    KEY_SKILL,

    /**
     * {@link de.hbt.pwr.view.model.entries.Language}
     */
    LANGUAGE,

    /**
     * {@link de.hbt.pwr.view.model.entries.Project}
     */
    PROJECT,

    /**
     * {@link de.hbt.pwr.view.model.entries.ProjectRole} independent from a {@link de.hbt.pwr.view.model.entries.Project}
     */
    PROJECT_ROLE,

    /**
     * {@link de.hbt.pwr.view.model.entries.Sector}
     */
    SECTOR,

    /**
     * {@link de.hbt.pwr.view.model.entries.Training}
     */
    TRAINING,

    /**
     * {@link de.hbt.pwr.view.model.skill.Skill} independent from a {@link de.hbt.pwr.view.model.entries.Project}
     */
    SKILL;
}
