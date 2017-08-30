package de.hbt.pwr.view.model.entries.sort;

import de.hbt.pwr.view.model.ViewProfile;

import java.util.List;

/**
 * Created by nt on 30.08.2017.
 */
public enum NameComparableEntryType implements NameComparableEntry {
    CAREER {
        @Override
        public List<? extends NameComparable> getComparable(ViewProfile viewProfile) {
            return viewProfile.getCareers();
        }
    },
    EDUCATION {
        @Override
        public List<? extends NameComparable> getComparable(ViewProfile viewProfile) {
            return viewProfile.getEducations();
        }
    },
    KEY_SKILL {
        @Override
        public List<? extends NameComparable> getComparable(ViewProfile viewProfile) {
            return viewProfile.getKeySkills();
        }
    },
    PROJECT_ROLE {
        @Override
        public List<? extends NameComparable> getComparable(ViewProfile viewProfile) {
            return viewProfile.getProjectRoles();
        }
    },
    QUALIFICATION {
        @Override
        public List<? extends NameComparable> getComparable(ViewProfile viewProfile) {
            return viewProfile.getQualifications();
        }
    },
    SECTOR {
        @Override
        public List<? extends NameComparable> getComparable(ViewProfile viewProfile) {
            return viewProfile.getSectors();
        }
    },
    TRAINING {
        @Override
        public List<? extends NameComparable> getComparable(ViewProfile viewProfile) {
            return viewProfile.getTrainings();
        }
    },
    LANGUAGE {
        @Override
        public List<? extends NameComparable> getComparable(ViewProfile viewProfile) {
            return viewProfile.getLanguages();
        }
    },
    DISPLAY_CATEGORY {
        @Override
        public List<? extends NameComparable> getComparable(ViewProfile viewProfile) {
            return viewProfile.getDisplayCategories();
        }
    }
}
