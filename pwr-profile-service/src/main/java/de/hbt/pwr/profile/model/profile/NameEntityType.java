package de.hbt.pwr.profile.model.profile;

import de.hbt.pwr.profile.model.profile.entries.*;
import org.apache.commons.lang.NotImplementedException;

import java.util.Set;

/**
 * Created by nt on 08.05.2017.
 */
@SuppressWarnings("unchecked")
public enum NameEntityType {
    EDUCATION() {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return EducationEntry.class;
        }

        @Override
        public <Entry extends ProfileEntry> Set<Entry> getEntryCollection(Profile profile) {
            return (Set<Entry>) profile.getEducation();
        }
    },
    LANGUAGE() {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return LanguageSkill.class;
        }

        @Override
        public <Entry extends ProfileEntry> Set<Entry> getEntryCollection(Profile profile) {
            return (Set<Entry>) profile.getLanguages();
        }
    },
    QUALIFICATION() {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return QualificationEntry.class;
        }

        @Override
        public <Entry extends ProfileEntry> Set<Entry> getEntryCollection(Profile profile) {
            return (Set<Entry>) profile.getQualification();
        }
    },
    SECTOR() {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return SectorEntry.class;
        }

        @Override
        public <Entry extends ProfileEntry> Set<Entry> getEntryCollection(Profile profile) {
            return (Set<Entry>) profile.getSectors();
        }
    },
    TRAINING() {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return TrainingEntry.class;
        }

        @Override
        public <Entry extends ProfileEntry> Set<Entry> getEntryCollection(Profile profile) {
            return (Set<Entry>) profile.getTrainingEntries();
        }
    },
    CAREER() {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return CareerEntry.class;
        }

        @Override
        public <Entry extends ProfileEntry> Set<Entry> getEntryCollection(Profile profile) {
            return (Set<Entry>) profile.getCareerEntries();
        }
    },
    SPECIAL_FIELD() {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            return SpecialFieldEntry.class;
        }

        @Override
        public <Entry extends ProfileEntry> Set<Entry> getEntryCollection(Profile profile) {
            return (Set<Entry>) profile.getSpecialFieldEntries();
        }
    },
    COMPANY() {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            throw new NotImplementedException("No idea what this is supposed to do");
        }

        @Override
        public <Entry extends ProfileEntry> Set<Entry> getEntryCollection(Profile profile) {
            throw new NotImplementedException("No idea what this is supposed to do");
        }
    },
    PROJECT_ROLE() {
        @Override
        public Class<? extends ProfileEntry> getProfileEntryClass() {
            throw new NotImplementedException("No idea what this is supposed to do");
        }

        @Override
        public <Entry extends ProfileEntry> Set<Entry> getEntryCollection(Profile profile) {
            throw new NotImplementedException("No idea what this is supposed to do");
        }
    };

    public abstract Class<? extends ProfileEntry> getProfileEntryClass();

    public abstract <Entry extends ProfileEntry> Set<Entry> getEntryCollection(Profile profile);
}


