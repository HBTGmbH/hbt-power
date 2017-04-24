/**
 * Created by nt on 24.04.2017.
 */

import {Sector} from './Sector';
import {Language} from './Language';
import {Education} from './Education';
import {Qualification} from './Qualification';
import {NormalizedProfile, Profile} from './Profile';
import {CareerPosition} from './CareerPosition';
import {EducationEntry} from './EducationEntry';
import {LanguageSkill} from './LanguageSkill';
import {QualificationEntry} from './QualificationEntry';
import {isNull, isNullOrUndefined} from 'util';
import {CareerElement} from './CareerElement';

interface APILanguageSkill {
    id: number;
    level: string;
    language: {
        id: number;
        name: string;
    }
}

interface APIEducation {
    id: number;
    date: string;
    education: {
        id: number;
        name: string;
    }
}

interface APIQualification {
    id: number;
    date: string;
    qualification: {
        id: number;
        name: string;
    }
}

interface APICareer {
    id: number;
    startDate: string;
    endDate: string;
    position: {
        id: number;
        position: string;
    }
}

/**
 * Internal database that avoids deeply nested structures by unwrapping them, saving entities in seperate arrays
 * instead of nested arrays in their respective entities.
 */
class InternalDatabase {

    public sectorsById: Array<Sector> = [];
    public languageNamesById: Array<Language> = [];
    public educationById: Array<Education> = [];
    public qualificationById: Array<Qualification> = [];
    public careerPositionsById: Array<CareerPosition> = [];

    public careerById : Array<CareerElement> = [];
    public educationEntriesById: Array<EducationEntry> = [];
    public languageSkillById: Array<LanguageSkill> = [];
    public qualificationEntryById: Array<QualificationEntry>;

    public profile: NormalizedProfile;


    private readSectors(sectors: Array<{"id": number, "name": string}>): void {
        // Possible sectors are provided by a different API.
        for(let i = 0; i < sectors.length; i++) {
            // Checks if the database already has the given sectors ID present. If thats the case,
            // The id may simply be added to the list of sectors in the profile
            if(!isNullOrUndefined(this.sectorsById[sectors[i].id])) {
                this.profile.sectors.push(sectors[i].id);
                // TODO validate name?
            } else {
                // We assume that the server that provides the data is always right, which means the
                // client is missing a data set.
                // This adds the sector to the currently known sectors.
                console.info("Client was missing a sector provided by the API. Missing sector was: ", sectors[i]);
                this.sectorsById[sectors[i].id] = sectors[i];
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
            console.info("Client was missing a language provided by the API. Missing language was: ", lang);
            this.languageNamesById[lang.id] = lang;
        } else if(this.languageNamesById[lang.id].name != lang.name) {
            this.languageNamesById[lang.id].name = lang.name;
        }
    }

    private validateEducation(education: {id: number, name:string}): void {
        if (isNullOrUndefined(this.educationById[education.id])) {
            console.info("Client was missing a education provided by the API. Missing education was: ", education);
            this.educationById[education.id] = education;
        } else if(this.educationById[education.id].name != education.name) {
            this.educationById[education.id].name = education.name;
        }
    }

    private validateQualification(qualification: {id: number, name: string}) : void {
        if (isNullOrUndefined(this.qualificationById[qualification.id])) {
            console.info("Client was missing a qualification provided by the API. Missing qualification was: ", qualification);
            this.qualificationById[qualification.id] = qualification;
        } else if(this.qualificationById[qualification.id].name != qualification.name) {
            this.qualificationById[qualification.id].name = qualification.name;
        }
    }

    private validateCareerPosition(position: {id: number, position: string}) : void {
        if (isNullOrUndefined(this.careerPositionsById[position.id])) {
            console.info("Client was missing a position provided by the API. Missing position was: ", position);
            this.careerPositionsById[position.id] = position;
        } else if(this.careerPositionsById[position.id].position != position.position) {
            this.careerPositionsById[position.id].position = position.position;
        }
    }

    private readLanguageSkills(langSkills: Array<APILanguageSkill>): void {
        // Clear all existing language skills.
        this.languageSkillById = [];
        for(let i = 0; i < langSkills.length; i++) {
            // Check that the language is still correct.
            this.validateLanguage(langSkills[i].language);
            // Add the now correct language skill to the profile.
            this.languageSkillById[langSkills[i].id] = langSkills[i];
        }
    }

    /**
     *
     * @param educationEntries
     */
    private readEducationEntries(educationEntries: Array<APIEducation>): void {
        // Clears all existing data to re-read from the API.
        this.educationEntriesById = [];
        for(let i = 0; i < educationEntries.length; i++) {
            this.validateEducation(educationEntries[i].education);
            this.educationEntriesById[educationEntries[i].id] = Object.assign(
                educationEntries[i],
                {date: new Date(educationEntries[i].date)}
                );
        }
    }

    private readQualficiationEntries(qualificationEntries: Array<APIQualification>): void {
        this.qualificationEntryById = [];
        for(let i = 0; i < qualificationEntries.length; i++) {
            this.validateQualification(qualificationEntries[i].qualification);
            this.qualificationEntryById[qualificationEntries[i].id] = Object.assign(
                qualificationEntries[i],
                {date: new Date(qualificationEntries[i].date)}
            );
        }
    }

    private readCareer(career: Array<APICareer>) : void {
        this.careerPositionsById = [];
        for(let i = 0; i < career.length; i++) {
            this.validateCareerPosition(career[i].position);
            this.careerById[career[i].id] = Object.assign(
                career[i],
                {
                    startDate: new Date(career[i].startDate),
                    endDate: new Date(career[i].endDate)
                }
            );
        }
    }

    /**
     * Attempts to interprete a full consultant profile and parses it into the database.
     * @param profileFromAPI the profile the API provides.
     */
    public serialize(profileFromAPI: any) {
        // Shortcut reference to this objects profile
        let prof = this.profile;

        prof.id = profileFromAPI.id;
        prof.currentPosition = profileFromAPI.currentPosition;
        prof.description = profileFromAPI.description;
        this.readSectors(profileFromAPI.sectors);
        this.readLanguageSkills(profileFromAPI.languages);
        this.readEducationEntries(profileFromAPI.education);
        this.readQualficiationEntries(profileFromAPI.qualification);
        this.readCareer(profileFromAPI.career);
    }


}