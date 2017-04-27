import * as Immutable from 'immutable';
import {Sector} from './Sector';
import {EducationEntry} from './EducationEntry';
import {LanguageSkill} from './LanguageSkill';
import {QualificationEntry} from './QualificationEntry';
import {CareerElement} from './CareerElement';
import {
    APICareerElement,
    APIEducationStep,
    APILanguageSkill,
    APIProfile,
    APIQualificationEntry,
    APISectorEntry
} from './APIProfile';
import {isNullOrUndefined} from 'util';
import {InternalDatabase} from './InternalDatabase';
import {ChangeItemIdAction} from '../reducers/singleProfile/singleProfileActions';
import {ProfileElementType} from '../Store';
import {SectorEntry} from './SectorEntry';

export class Profile {
    public readonly id: number;

    public readonly currentPosition: string;

    public readonly description: string;

    //FIXME refactor to sectorEntries
    public readonly sectors: Immutable.Map<number, SectorEntry> = Immutable.Map<number, SectorEntry>();

    public readonly careerElements: Immutable.Map<number, CareerElement> = Immutable.Map<number, CareerElement>();

    public readonly educationEntries: Immutable.Map<number, EducationEntry> = Immutable.Map<number, EducationEntry>();

    public readonly languageSkills: Immutable.Map<number, LanguageSkill> = Immutable.Map<number, LanguageSkill>();

    public readonly qualificationEntries: Immutable.Map<number, QualificationEntry> = Immutable.Map<number, QualificationEntry>();

    constructor(
        id: number,
        currentPosition: string,
        description: string,
        sectors: Immutable.Map<number, SectorEntry>,
        careerElements: Immutable.Map<number, CareerElement>,
        educationEntries: Immutable.Map<number, EducationEntry>,
        languageSkills: Immutable.Map<number, LanguageSkill>,
        qualificationEntries: Immutable.Map<number, QualificationEntry>,
    ) {
        this.id = id;
        this.currentPosition = currentPosition;
        this.description = description;
        this.sectors = sectors;
        this.careerElements = careerElements;
        this.educationEntries = educationEntries;
        this.languageSkills = languageSkills;
        this.qualificationEntries = qualificationEntries;
    }


    // == Non-mutating update functions == //

    public changeDescription(newDescription: string): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            newDescription,
            this.sectors,
            this.careerElements,
            this.educationEntries,
            this.languageSkills,
            this.qualificationEntries
        );
    }

    public changeCurrentPosition(newPosition: string): Profile {
        return new Profile(
            this.id,
            newPosition,
            this.description,
            this.sectors,
            this.careerElements,
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
            this.sectors,
            this.careerElements,
            this.educationEntries,
            this.languageSkills.set(languageSkill.id, languageSkill),
            this.qualificationEntries
        );
    }

    public removeLanguageSkill(id: number): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectors,
            this.careerElements,
            this.educationEntries,
            this.languageSkills.remove(id),
            this.qualificationEntries
        );
    }

    public updateCareerElement(careerElement: CareerElement): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectors,
            this.careerElements.set(careerElement.id, careerElement),
            this.educationEntries,
            this.languageSkills,
            this.qualificationEntries
        );
    }

    public removeCareerElement(careerElementId: number): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectors,
            this.careerElements.remove(careerElementId),
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
            this.sectors,
            this.careerElements,
            this.educationEntries.set(edcuationEntry.id, edcuationEntry),
            this.languageSkills,
            this.qualificationEntries
        );
    }

    public removeEducationEntry(id: number): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectors,
            this.careerElements,
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
            this.sectors,
            this.careerElements,
            this.educationEntries,
            this.languageSkills,
            this.qualificationEntries.set(qualificationEntry.id, qualificationEntry)
        );
    }

    removeQualificationEntry(id: number) {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectors,
            this.careerElements,
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
            this.sectors.set(sectorEntry.id, sectorEntry),
            this.careerElements,
            this.educationEntries,
            this.languageSkills,
            this.qualificationEntries
        );
    }

    removeSectorEntry(elementId: number): Profile {
        return new Profile(
            this.id,
            this.currentPosition,
            this.description,
            this.sectors.remove(elementId),
            this.careerElements,
            this.educationEntries,
            this.languageSkills,
            this.qualificationEntries
        );
    }

    // == Serialization & Deserialization == //

    private static parseSectors(sectors: Array<APISectorEntry>): Immutable.Map<number, SectorEntry> {
        let res: Immutable.Map<number, SectorEntry> = Immutable.Map<number, SectorEntry>();
        sectors.forEach(sectorEntry => {
            // In case the API returns something invalid.
            if(!isNullOrUndefined(sectorEntry)) {
                // We assume that the server that provides the data is always right, which means the
                // client is missing a data set.
                // This adds the sector to the currently known sectors.
                res = res.set(sectorEntry.id, SectorEntry.create(sectorEntry));
            }
        });
        return res;
    }

    private static parseLanguageSkills(langSkills: Array<APILanguageSkill>): Immutable.Map<number, LanguageSkill> {
        let res: Immutable.Map<number, LanguageSkill> = Immutable.Map<number, LanguageSkill>();
        langSkills.forEach(langSkill => {
            // In case the API returns something invalid.
            if(!isNullOrUndefined(langSkill)) {
                res = res.set(langSkill.id, LanguageSkill.create(langSkill));
            }
        });
        return res;
    }

    private static parseQualficiationEntries(qualificationEntries: Array<APIQualificationEntry>): Immutable.Map<number, QualificationEntry> {
        let res: Immutable.Map<number, QualificationEntry> = Immutable.Map<number, QualificationEntry>();
        qualificationEntries.forEach(qualificationEntry => {
            // The API might return something invalid. Ignore.
            if(!isNullOrUndefined(qualificationEntry)) {
                res = res.set(qualificationEntry.id, QualificationEntry.create(qualificationEntry));
            }
        });
        return res;
    }

    private static parseCareerElements(career: Array<APICareerElement>) : Immutable.Map<number, CareerElement> {
        let res = Immutable.Map<number, CareerElement>();
        career.forEach(careerElement =>{
            // The API might return something invalid. Ignore.
            if(!isNullOrUndefined(careerElement)) {
                res = res.set(careerElement.id, CareerElement.create(careerElement));
            }
        });
        return res;
    }

    /**
     *
     * @param educationEntries
     */
    private static parseEducationEntries(educationEntries: Array<APIEducationStep>): Immutable.Map<number, EducationEntry> {
        // TODO in case of performance issues, change the initialization method.
        let res: Immutable.Map<number, EducationEntry> = Immutable.Map<number, EducationEntry>();
        educationEntries.forEach(eductionEntry => {
            // The API might return something invalid. Ignore that.
            if(!isNullOrUndefined(eductionEntry)) {
                res = res.set(eductionEntry.id, EducationEntry.create(eductionEntry));
            }
        });
        return res;
    }

    // FIXME do not require database anymore, or refactor database so it doesn't contain
    // FIXME this profile anymore.
    public serializeToApiProfile(database: InternalDatabase): APIProfile {
        // Maps all career elements into an API format
        let career: Array<APICareerElement> = [];
        this.careerElements.forEach(careerElement => {
            career.push(careerElement.toAPICareer(database.careerPositions));
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
        this.sectors.forEach(sector => {
            sectors.push(sector.toAPISectorEntry(database.sectors));
        });

        let res: APIProfile = {
            id: this.id,
            description: this.description,
            currentPosition: this.currentPosition,
            career: career,
            languages: languages,
            qualification: qualifications,
            education: educations,
            sectors: sectors
        };
        console.log('Serialized profile:', res);
        return res;
    };

    public static create(profile: APIProfile): Profile {
        return new Profile(
            profile.id,
            profile.currentPosition,
            profile.description,
            Profile.parseSectors(profile.sectors),
            Profile.parseCareerElements(profile.career),
            Profile.parseEducationEntries(profile.education),
            Profile.parseLanguageSkills(profile.languages),
            Profile.parseQualficiationEntries(profile.qualification)
        );
    }


    public static createDefault(): Profile {
        return new Profile(
            -1,
            '',
            '',
            Immutable.Map<number, SectorEntry>(),
            Immutable.Map<number, CareerElement>(),
            Immutable.Map<number, EducationEntry>(),
            Immutable.Map<number, LanguageSkill>(),
            Immutable.Map<number, QualificationEntry>());
    }



}