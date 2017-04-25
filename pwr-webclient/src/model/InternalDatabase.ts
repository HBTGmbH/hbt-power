import {Sector} from './Sector';
import {Language} from './Language';
import {Education} from './Education';
import {Qualification} from './Qualification';
import {CareerPosition} from './CareerPosition';
import {EducationEntry} from './EducationEntry';
import {LanguageSkill} from './LanguageSkill';
import {QualificationEntry} from './QualificationEntry';
import {isNullOrUndefined} from 'util';
import {CareerElement} from './CareerElement';
import {RequestStatus} from '../Store';
import {Map} from 'immutable';
import {
    APICareerElement,
    APICareerPosition,
    APIEducation,
    APIEducationStep,
    APILanguage,
    APILanguageSkill,
    APIProfile,
    APIQualification,
    APIQualificationEntry, APISector
} from './APIProfile';
import * as Immutable from 'immutable';


/**
 * Internal databaseReducer that avoids deeply nested structures by unwrapping them, saving entities in seperate arrays
 * instead of nested arrays in their respective entities.
 *
 * Entities itself are stored in associative arrays, and may be accessed in the following manner: <code>entitiesById[myEntity.id]</code>
 * To allow fast iteration over all entities in one of these associative arrays, a second array exists for each entity.
 * This array stores all currently available entity IDs.
 */
export class InternalDatabase {
    public currentPosition: string;

    public profileId: number;

    public description: string;

    public APIRequestStatus: RequestStatus;

    public languageLevels: Array<string> = ["Beginner", "Intermediate", "Expert", "Native"];

    public sectorsById: Array<Sector> = [];
    public sectorIds: Array<number> = [];




    public qualificationById: Array<Qualification> = [];
    public qualificationIds: Array<number> = [];

    // == Career == //
    public careerPositions : Immutable.Map<number, CareerPosition> = Immutable.Map<number, CareerPosition>();
    public careerElements: Immutable.Map<number, CareerElement> = Immutable.Map<number, CareerElement>();

    // == Education == //
    public educationEntries: Immutable.Map<number, EducationEntry> = Immutable.Map<number, EducationEntry>();
    public educations: Immutable.Map<number, Education> = Immutable.Map<number, Education>();

    // == Languages == //
    public languageSkills: Immutable.Map<number, LanguageSkill> = Immutable.Map<number, LanguageSkill>();
    public languages: Immutable.Map<number, Language> = Immutable.Map<number, Language>();

    public qualificationEntriesById: Array<QualificationEntry> = [];
    public qualificationEntryIds: Array<number> = [];


    /**
     * Checks if the server still has the correct language that is associated with the id of the given language.
     * If the language is not existent, it is created.
     * If the language is different from the saved one, the saved language is modified.
     * If the language is still valid, nothing changes
     * @param lang
     * @returns {boolean}
     */
    private validateLanguage(lang: APILanguage) {
        if (!this.languages.has(lang.id)) {
            console.info('Client was missing a language provided by the API. Missing language was: ', lang);
        }
        this.languages = this.languages.set(lang.id, Language.create(lang));
    }

    private validateEducation(education: APIEducation): void {
        if (!this.educations.has(education.id)) {
            console.info('Client was missing a education provided by the API. Missing education was: ', education);
        }
        this.educations = this.educations.set(education.id, Education.create(education));
    }

    private validateQualification(qualification: APIQualification) : void {
        if (isNullOrUndefined(this.qualificationById[qualification.id])) {
            console.info('Client was missing a qualification provided by the API. Missing qualification was: ', qualification);
            this.qualificationIds.push(qualification.id);
        }
        this.qualificationById[qualification.id] = Qualification.create(qualification);
    }

    private validateCareerPosition(position: APICareerPosition) : void {
        if (!this.careerPositions.has(position.id)) {
            console.info('Client was missing a position provided by the API. Missing position was: ', position);
        }
        this.careerPositions = this.careerPositions.set(position.id, CareerPosition.create(position));
    }



    private readSectors(sectors: Array<APISector>): void {
        this.sectorsById = [];
        sectors.forEach(sector => {
            // In case the API returns something invalid.
            if(!isNullOrUndefined(sector)) {
                // We assume that the server that provides the data is always right, which means the
                // client is missing a data set.
                // This adds the sector to the currently known sectors.
                this.sectorsById[sector.id] = Sector.create(sector);
                this.sectorIds.push(sector.id);
            }
        });

    }

    private readLanguageSkills(langSkills: Array<APILanguageSkill>): void {
        // Clear all existing language skills.
        this.languageSkills = this.languageSkills.clear();
        let that = this;
        langSkills.forEach(langSkill => {
            // In case the API returns something invalid.
            if(!isNullOrUndefined(langSkill)) {
                // Check that the language is still correct.
                that.validateLanguage(langSkill.language);
                // Add the now correct language skill to the profile.
                that.languageSkills = that.languageSkills.set(langSkill.id, LanguageSkill.create(langSkill));
            }
        });
    }



    private readQualficiationEntries(qualificationEntries: Array<APIQualificationEntry>): void {
        this.qualificationEntriesById = [];
        let that = this;
        qualificationEntries.forEach(qualificationEntry => {
            // The API might return something invalid. Ignore.
            if(!isNullOrUndefined(qualificationEntry)) {
                that.validateQualification(qualificationEntry.qualification);
                that.qualificationEntriesById[qualificationEntry.id] = QualificationEntry.create(qualificationEntry);
                that.qualificationEntryIds.push(qualificationEntry.id);
            }
        });
    }

    private readCareer(career: Array<APICareerElement>) : void {
        this.careerElements = this.careerElements.clear();
        let that = this;
        career.forEach(careerStep =>{
            // The API might return something invalid. Ignore.
            if(!isNullOrUndefined(careerStep)) {
                that.validateCareerPosition(careerStep.position);
                that.careerElements = this.careerElements.set(careerStep.id, CareerElement.create(careerStep));
            }
        });
    }

    /**
     *
     * @param educationEntries
     */
    private readEducationEntries(educationEntries: Array<APIEducationStep>): void {
        // Clears all existing data to re-read from the API.
        this.educationEntries = this.educationEntries.clear();
        let that = this;
        educationEntries.forEach(eductionEntry => {
            // The API might return something invalid. Ignore that.
            if(!isNullOrUndefined(eductionEntry)) {
                that.validateEducation(eductionEntry.education);
                that.educationEntries = that.educationEntries.set(eductionEntry.id, EducationEntry.create(eductionEntry));
            }
        });
    }


    public addAPILanguages(languages: Array<APILanguage>) {
        languages.forEach(lang => {
            this.languages = this.languages.set(lang.id, Language.create(lang));
        })
    }

    /**
     * Attempts to interprete a full consultant profile and parses it into the databaseReducer.
     * @param profileFromAPI the profile the API provides.
     */
    public parseFromAPI(profileFromAPI: any) {
        console.debug("Parsing Profile data");
        this.profileId = profileFromAPI.id;
        this.currentPosition = profileFromAPI.currentPosition;
        this.description = profileFromAPI.description;
        console.debug("Parsing sector data");
        this.readSectors(profileFromAPI.sectors);
        console.debug("Parsing language data");
        this.readLanguageSkills(profileFromAPI.languages);
        console.debug("Parsing education data");
        this.readEducationEntries(profileFromAPI.education);
        console.debug("Parsing qualification data");
        this.readQualficiationEntries(profileFromAPI.qualification);
        console.debug("Parsing career data");
        this.readCareer(profileFromAPI.career);
    }



    /**
     * Deserializes this database into an API profile that may be sent back to the server for an
     * update command.
     */
    public static serializeToAPI(toSerialize: InternalDatabase): APIProfile {
        // Maps all career elements into an API format
        let career: Array<APICareerElement> = [];
        toSerialize.careerElements.forEach(careerElement => {
            career.push(CareerElement.toAPICareer(careerElement, toSerialize.careerPositions));
        });

        // Maps all education steps into an API format.
        let educations: Array<APIEducationStep> = [];
        toSerialize.educationEntries.forEach(educationEntry => {
            educations.push(EducationEntry.toAPIEducationEntry(educationEntry, toSerialize.educations));
        });

        let languages: Array<APILanguageSkill> = [];
        toSerialize.languageSkills.forEach(languageSkill => {
            languages.push(languageSkill.toAPILanguageSkill(toSerialize.languages));
        });


        let qualifications: Array<APIQualificationEntry> = [];
        toSerialize.qualificationEntryIds.forEach(id => {
            qualifications.push(QualificationEntry.toAPIQualificationEntry(toSerialize.qualificationEntriesById[id], toSerialize.qualificationById));
        });

        let sectors: Array<Sector> = [];
        toSerialize.sectorIds.forEach(id => {
            sectors.push(Sector.toAPISector(toSerialize.sectorsById[id]))
        });
        let res: APIProfile = {
            id: toSerialize.profileId,
            description: toSerialize.description,
            currentPosition: toSerialize.currentPosition,
            career: career,
            languages: languages,
            qualification: qualifications,
            education: educations,
            sectors: sectors
        };
        console.log("Serialized profile:", res);
        return res;
    }




}