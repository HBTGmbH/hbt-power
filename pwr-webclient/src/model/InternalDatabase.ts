import {Language} from './Language';
import {Education} from './Education';
import {Qualification} from './Qualification';
import {CareerPosition} from './CareerPosition';
import {ProfileElementType, RequestStatus} from '../Store';
import * as Immutable from 'immutable';
import {APICareerPosition, APIEducation, APILanguage, APIProfile, APIQualification, APISector} from './APIProfile';
import {Profile} from './Profile';
import {Sector} from './Sector';
import {ProfileReducer} from '../reducers/singleProfile/profile-reducer';
import {ProfileActionCreator} from '../reducers/singleProfile/singleProfileActions';
import {isNullOrUndefined} from 'util';


/**
 * Internal databaseReducer that avoids deeply nested structures by unwrapping them, saving entities in seperate arrays
 * instead of nested arrays in their respective entities.
 *
 * Entities itself are stored in associative arrays, and may be accessed in the following manner: <code>entitiesById[myEntity.id]</code>
 * To allow fast iteration over all entities in one of these associative arrays, a second array exists for each entity.
 * This array stores all currently available entity IDs.
 */
export class InternalDatabase {


    public readonly APIRequestStatus: RequestStatus;

    public languageLevels: Array<string> = ["Beginner", "Intermediate", "Expert", "Native"];

    public readonly loggedInUser: string = "nt";

    public readonly profile: Profile;

    public readonly careerPositions : Immutable.Map<string, CareerPosition> = Immutable.Map<string, CareerPosition>();

    public readonly educations: Immutable.Map<string, Education> = Immutable.Map<string, Education>();

    public readonly languages: Immutable.Map<string, Language> = Immutable.Map<string, Language>();

    public readonly sectors: Immutable.Map<string, Sector> = Immutable.Map<string, Sector>();

    public readonly qualifications: Immutable.Map<string, Qualification> = Immutable.Map<string, Qualification>();


    constructor(
        apiRequestStatus: RequestStatus,
        languageLevels: Array<string>,
        profile: Profile,
        careerPositions: Immutable.Map<string, CareerPosition>,
        educations: Immutable.Map<string, Education>,
        languages: Immutable.Map<string, Language>,
        qualifications: Immutable.Map<string, Qualification>,
        sectors:  Immutable.Map<string, Sector>
) {
        this.APIRequestStatus = apiRequestStatus;
        this.languageLevels = languageLevels;
        this.profile = profile;
        this.careerPositions = careerPositions;
        this.educations = educations;
        this.languages = languages;
        this.qualifications = qualifications;
        this.sectors = sectors;
    }

    public static createWithDefaults(): InternalDatabase {
        return new InternalDatabase(
            RequestStatus.Successful,
            ["Beginner", "Intermediate", "Expert", "Native"],
            Profile.createDefault(),
            Immutable.Map<string, CareerPosition>(),
            Immutable.Map<string, Education>(),
            Immutable.Map<string, Language>(),
            Immutable.Map<string, Qualification>(),
            Immutable.Map<string, Sector>()
        )
    }

    public getSectorByName(name: string): Sector {
        let result: Sector = null;
        this.sectors.some(((value, key) => {
            if (value.name === name) {
                result = value;
                return true;
            }
            return false;
        }));
        return result;
    }

    public changeAPIRequestStatus(newStatus: RequestStatus): InternalDatabase {
        return new InternalDatabase(
            newStatus,
            this.languageLevels,
            this.profile,
            this.careerPositions,
            this.educations,
            this.languages,
            this.qualifications,
            this.sectors
        )
    }

    public updateProfile(newProfile: Profile): InternalDatabase {
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            newProfile,
            this.careerPositions,
            this.educations,
            this.languages,
            this.qualifications,
            this.sectors
        )
    }

    /**
     * Creates a new sector and, optionally, adds it to the profile element with the given ID as name entity.
     * FIXME NT
     * @param newSector
     * @param entryId
     * @returns {InternalDatabase}
     */
    public createNewSector(newSector: Sector, entryId?: string): InternalDatabase {
        let profile: Profile = this.profile;
        if(!isNullOrUndefined(entryId)) {
            profile = ProfileReducer.reducerHandleItemIdChange(
                this.profile,
                ProfileActionCreator.changeItemId(newSector.id, entryId, ProfileElementType.SectorEntry));
        }
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            profile,
            this.careerPositions,
            this.educations,
            this.languages,
            this.qualifications,
            this.sectors.set(newSector.id, newSector)
        )
    }


    /**
     * Non-mutating function that adds all given languages into the {@link InternalDatabase.languages} map.
     * @param languages to add into the map
     * @returns {InternalDatabase} copy of the old {@link InternalDatabase} in which the languages are modified.
     */
    public addAPILanguages(languages: Array<APILanguage>): InternalDatabase {
        console.info("Receiving additional languages: ", languages);
        let newLangs: Immutable.Map<string, Language> = this.languages;
        languages.forEach(apiLang => {
            let lang: Language = Language.fromAPI(apiLang);
            newLangs = newLangs.set(lang.id, lang);
        });
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            this.careerPositions,
            this.educations,
            newLangs,
            this.qualifications,
            this.sectors
        )
    }

    public addAPIEducations(educations: Array<APIEducation>): InternalDatabase {
        console.info("Receiving additional educations:", educations);
        let newEducations: Immutable.Map<string, Education> = this.educations;
        educations.forEach(apiEducation => {
            let education: Education = Education.fromAPI(apiEducation);
            newEducations = newEducations.set(education.id, education);
        });
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            this.careerPositions,
            newEducations,
            this.languages,
            this.qualifications,
            this.sectors
        )
    }

    public addAPIQualifications(qualifications: Array<APIQualification>) {
        console.info("Receiving additional qualifications:", qualifications);
        let newQualifications: Immutable.Map<string, Qualification> = this.qualifications;
        qualifications.forEach(apiQualification => {
            let qualification: Qualification = Qualification.fromAPI(apiQualification);
            newQualifications = newQualifications.set(qualification.id, qualification);
        });
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            this.careerPositions,
            this.educations,
            this.languages,
            newQualifications,
            this.sectors
        )
    }

    public addAPICareers(careers: Array<APICareerPosition>) {
        console.info("Receiving additional career positions:", careers);
        let newCareerPositions: Immutable.Map<string, CareerPosition> = this.careerPositions;
        careers.forEach(apiCareerPos => {
            let careerPos: CareerPosition = CareerPosition.fromAPI(apiCareerPos);
            newCareerPositions = newCareerPositions.set(careerPos.id, careerPos);
        });
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            newCareerPositions,
            this.educations,
            this.languages,
            this.qualifications,
            this.sectors
        )
    }

    public addAPISectors(sectors: Array<APISector>) {
        console.info("Receiving additional sectors:", sectors);
        let newSectors: Immutable.Map<string, Sector> = this.sectors;
        sectors.forEach(apiSector => {
            let sector: Sector = Sector.fromAPI(apiSector);
            newSectors = newSectors.set(sector.id, sector);
        });
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            this.careerPositions,
            this.educations,
            this.languages,
            this.qualifications,
            newSectors
        )
    }

    /**
     * Attempts to interprete a full consultant profile and parses it into the databaseReducer.
     * @param profileFromAPI the profile the API provides.
     */
    public parseProfile(profileFromAPI: APIProfile): InternalDatabase {

        console.info("Adding Profile information into suggestion database.");

        // references to the readonly property to modify it.
        // This will not affect the original languages, as the original is still immutable.
        let languages = this.languages;
        profileFromAPI.languages.forEach(langSkill => {
            let l: Language = Language.fromAPI(langSkill.language);
            languages = languages.set(l.id, l);
        });

        let qualifications = this.qualifications;
        profileFromAPI.qualification.forEach(qualificationEntry => {
           let q: Qualification = Qualification.fromAPI(qualificationEntry.qualification);
           qualifications = qualifications.set(q.id, q);
        });

        let careerPositions = this.careerPositions;
        profileFromAPI.career.forEach(careerPosition => {
            let career: CareerPosition = CareerPosition.fromAPI(careerPosition.position);
            careerPositions = careerPositions.set(career.id, career);
        });

        let educations = this.educations;
        profileFromAPI.education.forEach(educationEntry => {
            let education: Education = Education.fromAPI(educationEntry.education);
            educations = educations.set(education.id, education);
        });

        let sectors = this.sectors;
        profileFromAPI.sectors.forEach(sectorEntry => {
            let sector: Sector = Sector.fromAPI(sectorEntry.sector);
            sectors = sectors.set(sector.id, sector);
        });
        console.info("Parsing Profile");
        let profile: Profile = Profile.createFromAPI(profileFromAPI);

        console.info("Profile processing done. Result:", profile);

        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            profile,
            careerPositions,
            educations,
            languages,
            qualifications,
            sectors
        )
    }



    /**
     * Deserializes this database into an API profile that may be sent back to the server for an
     * update command.
     */
    public serializeToAPI(): APIProfile {
        // TODO this needs some refactoring:
        // - Suggestions into an own 'database'
        // - Profile has access to database
        return this.profile.serializeToApiProfile(this);
    }



}