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
import {
    APICareerElement,
    APICareerPosition,
    APIEducation,
    APIEducationStep,
    APILanguageSkill,
    APIProfile,
    APIQualification
} from './APIProfile';


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

    public languageLevels: Array<string> = ["Beginner", "Intermediate", "Expert", "Native"];

    public sectorsById: Array<Sector> = [];
    public sectorIds: Array<number> = [];

    public languageNamesById: Array<Language> = [];
    public languageNameIds: Array<number> = [];

    public educationById: Array<Education> = [];
    public educationIds: Array<number> = [];

    public qualificationById: Array<Qualification> = [];
    public qualificationIds: Array<number> = [];

    public careerPositionsById: Array<CareerPosition> = [];
    public careerPositionIds: Array<number> = [];

    public careerById : Array<CareerElement> = [];
    public careerIds: Array<number> = [];

    public educationEntriesById: Array<EducationEntry> = [];
    public educationEntryIds: Array<number> = [];

    public languageSkillById: Array<LanguageSkill> = [];
    public languageSkillIds: Array<number> = [];

    public qualificationEntriesById: Array<QualificationEntry> = [];
    public qualificationEntryIds: Array<number> = [];

    public profileId: number;
    public description: string;

    APIRequestStatus: RequestStatus;



    private readSectors(sectors: Array<{'id': number, 'name': string}>): void {
        // Possible sectors are provided by a different API.
        for(let i = 0; i < sectors.length; i++) {
            // Checks if the databaseReducer already has the given sectors ID present. If thats the case,
            // The id may simply be added to the list of sectors in the profile
            if(!isNullOrUndefined(this.sectorsById[sectors[i].id])) {
                this.sectorsById[sectors[i].id] = sectors[i];
                // TODO validate name?
            } else {
                // We assume that the server that provides the data is always right, which means the
                // client is missing a data set.
                // This adds the sector to the currently known sectors.
                console.info('Client was missing a sector provided by the API. Missing sector was: ', sectors[i]);
                this.sectorsById[sectors[i].id] = sectors[i];
                this.sectorIds.push(sectors[i].id);
            }
        }
    }

    /**
     * Checks if the server still has the correct language that is associated with the id of the given language.
     * If the language is not existent, it is created.
     * If the language is different from the saved one, the saved language is modified.
     * If the language is still valid, nothing changes
     * @param lang
     * @returns {boolean}
     */
    private validateLanguage(lang: {id: number, name: string}) {
        if (isNullOrUndefined(this.languageNamesById[lang.id])) {
            console.info('Client was missing a language provided by the API. Missing language was: ', lang);
            this.languageNameIds.push(lang.id);
            this.languageNamesById[lang.id] = lang;
        } else if(this.languageNamesById[lang.id].name != lang.name) {
            this.languageNamesById[lang.id].name = lang.name;
        }
    }

    private validateEducation(education: APIEducation): void {
        if (isNullOrUndefined(this.educationById[education.id])) {
            console.info('Client was missing a education provided by the API. Missing education was: ', education);
            this.educationIds.push(education.id);
        }
        this.educationById[education.id] = Education.create(education);
    }

    private validateQualification(qualification: {id: number, name: string}) : void {
        if (isNullOrUndefined(this.qualificationById[qualification.id])) {
            console.info('Client was missing a qualification provided by the API. Missing qualification was: ', qualification);
            this.qualificationIds.push(qualification.id);
            this.qualificationById[qualification.id] = qualification;
        } else if(this.qualificationById[qualification.id].name != qualification.name) {
            this.qualificationById[qualification.id].name = qualification.name;
        }
    }

    private validateCareerPosition(position: APICareerPosition) : void {
        if (isNullOrUndefined(this.careerPositionsById[position.id])) {
            console.info('Client was missing a position provided by the API. Missing position was: ', position);
            this.careerPositionIds.push(position.id);
        }
        this.careerPositionsById[position.id] = CareerPosition.create(position);
    }

    private readLanguageSkills(langSkills: Array<APILanguageSkill>): void {
        // Clear all existing language skills.
        this.languageSkillById = [];
        let that = this;
        langSkills.forEach(langSkill => {
            // In case the API returns something invalid.
            if(!isNullOrUndefined(langSkill)) {
                // Check that the language is still correct.
                that.validateLanguage(langSkill.language);
                // Add the now correct language skill to the profile.
                that.languageSkillById[langSkill.id] = {
                    languageId: langSkill.language.id,
                    id: langSkill.id,
                    level: langSkill.level
                };
                that.languageSkillIds.push(langSkill.id);
            }
        });
    }

    /**
     *
     * @param educationEntries
     */
    private readEducationEntries(educationEntries: Array<APIEducationStep>): void {
        // Clears all existing data to re-read from the API.
        this.educationEntriesById = [];
        let that = this;
        educationEntries.forEach(eductionEntry => {
            // The API might return something invalid. Ignore that.
            if(!isNullOrUndefined(eductionEntry)) {
                that.validateEducation(eductionEntry.education);
                that.educationEntriesById[eductionEntry.id] = EducationEntry.create(eductionEntry);
                that.educationEntryIds.push(eductionEntry.id);
            }
        });
    }


    private readQualficiationEntries(qualificationEntries: Array<APIQualification>): void {
        this.qualificationEntriesById = [];
        let that = this;
        qualificationEntries.forEach(qualificationEntry => {
            // The API might return something invalid. Ignore.
            if(!isNullOrUndefined(qualificationEntry)) {
                that.validateQualification(qualificationEntry.qualification);
                that.qualificationEntriesById[qualificationEntry.id] = {
                    id: qualificationEntry.id,
                    qualificationId: qualificationEntry.qualification.id,
                    date: new Date(qualificationEntry.date)
                };
                that.qualificationEntryIds.push(qualificationEntry.id);
            }
        });
    }

    private readCareer(career: Array<APICareerElement>) : void {
        this.careerPositionsById = [];
        let that = this;
        career.forEach(careerStep =>{
            // The API might return something invalid. Ignore.
            if(!isNullOrUndefined(careerStep)) {
                that.validateCareerPosition(careerStep.position);
                that.careerById[careerStep.id] = CareerElement.create(careerStep);
                that.careerIds.push(careerStep.id);
            }

        });
    }

    public addAPILanguages(languages: Array<{id: number, name: string}>) {
        languages.forEach(lang => {
            if(isNullOrUndefined(this.languageNamesById[lang.id])) {
                this.languageNamesById[lang.id] = lang;
                this.languageNameIds.push(lang.id);
            } else {
                console.info("Information mismatch for language entity. Updating language with id=" + lang.id + " to:", lang);
                this.languageNamesById[lang.id] = lang;
            }
        })
    }

    /**
     * Attempts to interprete a full consultant profile and parses it into the databaseReducer.
     * @param prevDB previous database used to keep values.
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
        let career: Array<APICareerElement> = [];
        toSerialize.careerIds.forEach(id => {
            career.push(CareerElement.toAPICareer(toSerialize.careerById[id], toSerialize.careerPositionsById));
        });
        let languages: Array<APILanguageSkill> = [];
        toSerialize.languageSkillIds.forEach(id => {
            languages.push(LanguageSkill.toAPILanguageSkill(toSerialize.languageSkillById[id], toSerialize.languageNamesById));
        });
        let qualifications: Array<APIQualification> = [];
        toSerialize.qualificationEntryIds.forEach(id => {
            qualifications.push(QualificationEntry.toAPIQualificationEntry(toSerialize.qualificationEntriesById[id], toSerialize.qualificationById));
        });
        let educations: Array<APIEducationStep> = [];
        toSerialize.educationEntryIds.forEach(id => {
            educations.push(EducationEntry.toAPIEducationEntry(toSerialize.educationEntriesById[id], toSerialize.educationById));
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