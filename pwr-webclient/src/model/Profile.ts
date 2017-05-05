import * as Immutable from 'immutable';
import {EducationEntry} from './EducationEntry';
import {LanguageSkill} from './LanguageSkill';
import {QualificationEntry} from './QualificationEntry';
import {TrainingEntry} from './TrainingEntry';
import {
    APIEducationStep,
    APILanguageSkill,
    APIProfile,
    APIQualificationEntry,
    APISectorEntry,
    APITrainingEntry
} from './APIProfile';
import {isNullOrUndefined} from 'util';
import {InternalDatabase} from './InternalDatabase';
import {SectorEntry} from './SectorEntry';

export class Profile {
    public readonly id: number;

    public readonly currentPosition: string;

    public readonly description: string;

    public readonly sectorEntries: Immutable.Map<string, SectorEntry> = Immutable.Map<string, SectorEntry>();

    public readonly trainingEntries: Immutable.Map<string, TrainingEntry> = Immutable.Map<string, TrainingEntry>();

    public readonly educationEntries: Immutable.Map<string, EducationEntry> = Immutable.Map<string, EducationEntry>();

    public readonly languageSkills: Immutable.Map<string, LanguageSkill> = Immutable.Map<string, LanguageSkill>();

    public readonly qualificationEntries: Immutable.Map<string, QualificationEntry> = Immutable.Map<string, QualificationEntry>();

    constructor(
        id: number,
        currentPosition: string,
        description: string,
        sectors: Immutable.Map<string, SectorEntry>,
        careerElements: Immutable.Map<string, TrainingEntry>,
        educationEntries: Immutable.Map<string, EducationEntry>,
        languageSkills: Immutable.Map<string, LanguageSkill>,
        qualificationEntries: Immutable.Map<string, QualificationEntry>,
    ) {
        this.id = id;
        this.currentPosition = currentPosition;
        this.description = description;
        this.sectorEntries = sectors;
        this.trainingEntries = careerElements;
        this.educationEntries = educationEntries;
        this.languageSkills = languageSkills;
        this.qualificationEntries = qualificationEntries;
    }


    // == Non-mutating update functions == //

    /**
     * Non-mutating function that returns a copy of this {@link Profile} with the {@link Profile.description} set to the
     * given value.
     * @param newDescription is the description that is set into the new profile.
     * @returns {Profile} a copy of the old profile with the new {@link Profile.description}
     */
    public changeDescription(newDescription: string): Profile {
        return new Profile(this.id, this.currentPosition, newDescription, this.sectorEntries, this.trainingEntries,
            this.educationEntries, this.languageSkills, this.qualificationEntries
        );
    }

    /**
     * Non-mutating function that returns a copy of this {@link Profile] with the {@link Profile.currentPosition} set
     * to the given value
     * @param newPosition is set into the new Profile
     * @returns {Profile} a copy of the old profile with the new {@link Profile.currentPosition}
     */
    public changeCurrentPosition(newPosition: string): Profile {
        return new Profile(
            this.id,
            newPosition,
            this.description,
            this.sectorEntries,
            this.trainingEntries,
            this.educationEntries,
            this.languageSkills,
            this.qualificationEntries
        );
    }


    public updateLanguageSkill(languageSkill: LanguageSkill): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectorEntries,
            this.trainingEntries,
            this.educationEntries,
            this.languageSkills.set(languageSkill.id, languageSkill),
            this.qualificationEntries
        );
    }

    public removeLanguageSkill(id: string): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectorEntries,
            this.trainingEntries,
            this.educationEntries,
            this.languageSkills.remove(id),
            this.qualificationEntries
        );
    }

    public updateTrainingEntry(trainingEntry: TrainingEntry): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectorEntries,
            this.trainingEntries.set(trainingEntry.id, trainingEntry),
            this.educationEntries,
            this.languageSkills,
            this.qualificationEntries
        );
    }

    public removeCareerElement(careerElementId: string): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectorEntries,
            this.trainingEntries.remove(careerElementId),
            this.educationEntries,
            this.languageSkills,
            this.qualificationEntries
        );
    }

    public updateEducationEntry(edcuationEntry: EducationEntry): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectorEntries,
            this.trainingEntries,
            this.educationEntries.set(edcuationEntry.id, edcuationEntry),
            this.languageSkills,
            this.qualificationEntries
        );
    }

    public removeEducationEntry(id: string): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectorEntries,
            this.trainingEntries,
            this.educationEntries.remove(id),
            this.languageSkills,
            this.qualificationEntries
        );
    }

    public updateQualificationEntry(qualificationEntry: QualificationEntry): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectorEntries,
            this.trainingEntries,
            this.educationEntries,
            this.languageSkills,
            this.qualificationEntries.set(qualificationEntry.id, qualificationEntry)
        );
    }

    removeQualificationEntry(id: string) {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectorEntries,
            this.trainingEntries,
            this.educationEntries,
            this.languageSkills,
            this.qualificationEntries.remove(id)
        );
    }

    public updateSectorEntry(sectorEntry: SectorEntry): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectorEntries.set(sectorEntry.id, sectorEntry),
            this.trainingEntries,
            this.educationEntries,
            this.languageSkills,
            this.qualificationEntries
        );
    }

    removeSectorEntry(elementId: string): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectorEntries.remove(elementId),
            this.trainingEntries,
            this.educationEntries,
            this.languageSkills,
            this.qualificationEntries
        );
    }



    // == Serialization & Deserialization == //

    private static parseSectors(sectors: Array<APISectorEntry>): Immutable.Map<string, SectorEntry> {
        let res: Immutable.Map<string, SectorEntry> = Immutable.Map<string, SectorEntry>();
        sectors.forEach(apiSectorEntry => {
            // In case the API returns something invalid.
            if(!isNullOrUndefined(apiSectorEntry)) {
                // We assume that the server that provides the data is always right, which means the
                // client is missing a data set.
                // This adds the sector to the currently known sectorEntries.
                let sectorEntry: SectorEntry = SectorEntry.create(apiSectorEntry);
                res = res.set(sectorEntry.id, sectorEntry);
            }
        });
        return res;
    }

    private static parseLanguageSkills(langSkills: Array<APILanguageSkill>): Immutable.Map<string, LanguageSkill> {
        let res: Immutable.Map<string, LanguageSkill> = Immutable.Map<string, LanguageSkill>();
        langSkills.forEach(apiLangSkill => {
            // In case the API returns something invalid.
            if(!isNullOrUndefined(apiLangSkill)) {
                let langSkill: LanguageSkill = LanguageSkill.fromAPI(apiLangSkill);
                res = res.set(langSkill.id, langSkill);
            }
        });
        return res;
    }

    private static parseQualficiationEntries(qualificationEntries: Array<APIQualificationEntry>): Immutable.Map<string, QualificationEntry> {
        let res: Immutable.Map<string, QualificationEntry> = Immutable.Map<string, QualificationEntry>();
        qualificationEntries.forEach(apiQualificationEntry => {
            // The API might return something invalid. Ignore.
            if(!isNullOrUndefined(apiQualificationEntry)) {
                let qualificationEntry: QualificationEntry = QualificationEntry.fromAPI(apiQualificationEntry);
                res = res.set(qualificationEntry.id, qualificationEntry);
            }
        });
        return res;
    }

    private static parseTrainingEntries(career: Array<APITrainingEntry>) : Immutable.Map<string, TrainingEntry> {
        let res = Immutable.Map<string, TrainingEntry>();
        career.forEach(apiTrainingEntry =>{
            // The API might return something invalid. Ignore.
            if(!isNullOrUndefined(apiTrainingEntry)) {
                let careerElement: TrainingEntry = TrainingEntry.fromAPI(apiTrainingEntry);
                res = res.set(careerElement.id, careerElement);
            }
        });
        return res;
    }

    /**
     *
     * @param educationEntries
     */
    private static parseEducationEntries(educationEntries: Array<APIEducationStep>): Immutable.Map<string, EducationEntry> {
        // TODO in case of performance issues, change the initialization method.
        let res: Immutable.Map<string, EducationEntry> = Immutable.Map<string, EducationEntry>();
        educationEntries.forEach(apiEducationEntry => {
            // The API might return something invalid. Ignore that.
            if(!isNullOrUndefined(apiEducationEntry)) {
                let educationEntry: EducationEntry = EducationEntry.fromAPI(apiEducationEntry);
                res = res.set(educationEntry.id, educationEntry);
            }
        });
        return res;
    }

    // FIXME do not require database anymore, or refactor database so it doesn't contain
    // FIXME this profile anymore.
    public serializeToApiProfile(database: InternalDatabase): APIProfile {
        // Maps all career elements into an API format
        let training: Array<APITrainingEntry> = [];
        this.trainingEntries.forEach(trainingEntry => {
            training.push(trainingEntry.toAPICareer(database.trainings));
        });

        // Maps all education steps into an API format.
        let educations: Array<APIEducationStep> = [];
        this.educationEntries.forEach(educationEntry => {
            educations.push(educationEntry.toAPIEducationEntry(database.educations));
        });

        let languages: Array<APILanguageSkill> = [];
        this.languageSkills.forEach(languageSkill => {
            languages.push(languageSkill.toAPILanguageSkill(database.languages));
        });


        let qualifications: Array<APIQualificationEntry> = [];
        this.qualificationEntries.forEach(qualificationEntry => {
            qualifications.push(qualificationEntry.toAPIQualificationEntry(database.qualifications));
        });

        let sectors: Array<APISectorEntry> = [];
        this.sectorEntries.forEach(sector => {
            sectors.push(sector.toAPISectorEntry(database.sectors));
        });

        let res: APIProfile = {
            id: this.id,
            description: this.description,
            currentPosition: this.currentPosition,
            trainingEntries: training,
            languages: languages,
            qualification: qualifications,
            education: educations,
            sectors: sectors
        };
        console.log('Serialized profile:', res);
        return res;
    };

    /**
     * Constructs a profile from an API profile.
     * @param profile
     * @returns {Profile}
     */
    public static createFromAPI(profile: APIProfile): Profile {
        return new Profile(
            Number(profile.id),
            profile.currentPosition,
            profile.description,
            Profile.parseSectors(profile.sectors),
            Profile.parseTrainingEntries(profile.trainingEntries),
            Profile.parseEducationEntries(profile.education),
            Profile.parseLanguageSkills(profile.languages),
            Profile.parseQualficiationEntries(profile.qualification)
        );
    }



    /**
     * Creates a default, immutable Profile that can be considered as 'empty'
     *
     * The default profile has all Immutable.Maps initialized to empty maps, the possible string values initialized
     * with an empty string, and the ID initialized with -1.
     *
     * @returns {Profile} the default profile.
     */
    public static createDefault(): Profile {
        return new Profile(
            -1,
            '',
            '',
            Immutable.Map<string, SectorEntry>(),
            Immutable.Map<string, TrainingEntry>(),
            Immutable.Map<string, EducationEntry>(),
            Immutable.Map<string, LanguageSkill>(),
            Immutable.Map<string, QualificationEntry>());
    }


}