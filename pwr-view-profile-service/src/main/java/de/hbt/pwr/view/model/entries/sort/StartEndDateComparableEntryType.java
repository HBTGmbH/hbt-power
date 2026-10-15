package de.hbt.pwr.view.model.entries.sort;

import de.hbt.pwr.view.model.ViewProfile;

import java.util.List;

/**
 * @author nt (nt@hbt.de)
 */
public enum StartEndDateComparableEntryType implements StartEndDateComparableEntry {
    PROJECT {
        @Override
        public List<? extends StartEndDateComparable> getComparable(ViewProfile viewProfile) {
            return viewProfile.getProjects();
        }
    },
    CAREER {
        @Override
        public List<? extends StartEndDateComparable> getComparable(ViewProfile viewProfile) {
            return viewProfile.getCareers();
        }
    },
    EDUCATION {
        @Override
        public List<? extends StartEndDateComparable> getComparable(ViewProfile viewProfile) {
            return viewProfile.getEducations();
        }
    },
    TRAINING {
        @Override
        public List<? extends StartEndDateComparable> getComparable(ViewProfile viewProfile) {
            return viewProfile.getTrainings();
        }
    }
}
