package de.hbt.pwr.profile.model.profile;

import de.hbt.pwr.profile.model.profile.entries.*;

/**
 * Created by nt on 08.05.2017.
 */
public enum NameEntityType {
    EDUCATION {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return EducationEntry.class;
        }
    },
    LANGUAGE {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return LanguageSkill.class;
        }
    },
    QUALIFICATION {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return QualificationEntry.class;
        }
    },
    SECTOR {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return SectorEntry.class;
        }
    },
    TRAINING {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return TrainingEntry.class;
        }
    },
    CAREER {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return CareerEntry.class;
        }
    },
    KEY_SKILL {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return KeySkillEntry.class;
        }
    },
    COMPANY {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return null;
        }
    },
    PROJECT_ROLE {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return null;
        }
    };

    public abstract Class<? extends ProfileEntry> getProfileEntryClass();
}
