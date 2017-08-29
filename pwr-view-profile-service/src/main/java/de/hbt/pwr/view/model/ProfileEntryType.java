package de.hbt.pwr.view.model;

import de.hbt.pwr.view.model.entries.ToggleableEntry;
import de.hbt.pwr.view.model.entries.sort.ToggleableType;

import java.util.List;

/**
 * @author nt / nt@hbt.de
 * @since 28.08.2017
 */
public enum ProfileEntryType implements ToggleableType {
    /**
     * {@link de.hbt.pwr.view.model.entries.Career}
     */
    CAREER {
        @Override
        public List<? extends ToggleableEntry> getToggleable(ViewProfile viewProfile) {
            return viewProfile.getCareers();
        }
    },

    /**
     * {@link de.hbt.pwr.view.model.entries.Education}
     */
    EDUCATION {
        @Override
        public List<? extends ToggleableEntry> getToggleable(ViewProfile viewProfile) {
            return viewProfile.getEducations();
        }
    },

    /**
     * {@link de.hbt.pwr.view.model.entries.KeySkill}
     */
    KEY_SKILL {
        @Override
        public List<? extends ToggleableEntry> getToggleable(ViewProfile viewProfile) {
            return viewProfile.getKeySkills();
        }
    },

    /**
     * {@link de.hbt.pwr.view.model.entries.Language}
     */
    LANGUAGE {
        @Override
        public List<? extends ToggleableEntry> getToggleable(ViewProfile viewProfile) {
            return viewProfile.getLanguages();
        }
    },

    /**
     * {@link de.hbt.pwr.view.model.entries.Project}
     */
    PROJECT {
        @Override
        public List<? extends ToggleableEntry> getToggleable(ViewProfile viewProfile) {
            return viewProfile.getProjects();
        }
    },

    /**
     * {@link de.hbt.pwr.view.model.entries.ProjectRole} independent from a {@link de.hbt.pwr.view.model.entries.Project}
     */
    PROJECT_ROLE {
        @Override
        public List<? extends ToggleableEntry> getToggleable(ViewProfile viewProfile) {
            return viewProfile.getProjectRoles();
        }
    },

    /**
     * {@link de.hbt.pwr.view.model.entries.Sector}
     */
    SECTOR {
        @Override
        public List<? extends ToggleableEntry> getToggleable(ViewProfile viewProfile) {
            return viewProfile.getSectors();
        }
    },

    /**
     * {@link de.hbt.pwr.view.model.entries.Training}
     */
    TRAINING {
        @Override
        public List<? extends ToggleableEntry> getToggleable(ViewProfile viewProfile) {
            return viewProfile.getTrainings();
        }
    },

    /**
     * {@link de.hbt.pwr.view.model.skill.Skill} independent from a {@link de.hbt.pwr.view.model.entries.Project}
     */
    SKILL {
        @Override
        public List<? extends ToggleableEntry> getToggleable(ViewProfile viewProfile) {
            return viewProfile.getSkills();
        }
    };
}
