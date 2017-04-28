import {Language} from './Language';
import {Education} from './Education';
import {Qualification} from './Qualification';
import {CareerPosition} from './CareerPosition';
import {RequestStatus} from '../Store';
import * as Immutable from 'immutable';
import {APICareerPosition, APIEducation, APILanguage, APIProfile, APIQualification, APISector} from './APIProfile';
import {Profile} from './Profile';
import {Sector} from './Sector';


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

    public readonly careerPositions : Immutable.Map<number, CareerPosition> = Immutable.Map<number, CareerPosition>();

    public readonly educations: Immutable.Map<number, Education> = Immutable.Map<number, Education>();

    public readonly languages: Immutable.Map<number, Language> = Immutable.Map<number, Language>();

    public readonly sectors: Immutable.Map<number, Sector> = Immutable.Map<number, Sector>();

    public readonly qualifications: Immutable.Map<number, Qualification> = Immutable.Map<number, Qualification>();


    constructor(
        apiRequestStatus: RequestStatus,
        languageLevels: Array<string>,
        profile: Profile,
        careerPositions: Immutable.Map<number, CareerPosition>,
        educations: Immutable.Map<number, Education>,
        languages: Immutable.Map<number, Language>,
        qualifications: Immutable.Map<number, Qualification>,
        sectors:  Immutable.Map<number, Sector>
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
            Immutable.Map<number, CareerPosition>(),
            Immutable.Map<number, Education>(),
            Immutable.Map<number, Language>(),
            Immutable.Map<number, Qualification>(),
            Immutable.Map<number, Sector>()
        )
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

    public changeProfile(newProfile: Profile): InternalDatabase {
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
     * Non-mutating function that adds all given languages into the {@link InternalDatabase.languages} map.
     * @param languages to add into the map
     * @returns {InternalDatabase} copy of the old {@link InternalDatabase} in which the languages are modified.
     */
    public addAPILanguages(languages: Array<APILanguage>): InternalDatabase {
        console.info("Receiving additional languages: ", languages);
        let newLangs: Immutable.Map<number, Language> = this.languages;
        languages.forEach(lang => {
            newLangs = newLangs.set(lang.id, Language.create(lang));
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
        let newEducations: Immutable.Map<number, Education> = this.educations;
        educations.forEach(education => {
            newEducations = newEducations.set(education.id, Education.create(education));
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

    addAPIQualifications(qualifications: Array<APIQualification>) {
        console.info("Receiving additional qualifications:", qualifications);
        let newQualifications: Immutable.Map<number, Qualification> = this.qualifications;
        qualifications.forEach(qualification => {
            newQualifications = newQualifications.set(qualification.id, Qualification.create(qualification));
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

    addAPICareers(careers: Array<APICareerPosition>) {
        console.info("Receiving additional career positions:", careers);
        let newCareerPositions: Immutable.Map<number, CareerPosition> = this.careerPositions;
        careers.forEach(careerPos => {
            newCareerPositions = newCareerPositions.set(careerPos.id, CareerPosition.create(careerPos));
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

    addAPISectors(sectors: Array<APISector>) {
        console.info("Receiving additional sectors:", sectors);
        let newSectors: Immutable.Map<number, Sector> = this.sectors;
        sectors.forEach(sector => newSectors = newSectors.set(sector.id, Sector.create(sector)));
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
        console.info("Parsing Profile");
        let profile: Profile = Profile.createFromAPI(profileFromAPI);
        console.info("Adding Profile information into suggestion database.");

        // references to the readonly property to modify it.
        // This will not affect the original languages, as the original is still immutable.
        let languages = this.languages;
        profileFromAPI.languages.forEach(langSkill => {
            languages = languages.set(langSkill.language.id, Language.create(langSkill.language));
        });

        let qualifications = this.qualifications;
        profileFromAPI.qualification.forEach(qualificationEntry => {
           let q: Qualification = qualificationEntry.qualification;
           qualifications = qualifications.set(q.id, Qualification.create(q));
        });

        let careerPositions = this.careerPositions;
        profileFromAPI.career.forEach(careerPosition => {
            let career = careerPosition.position;
            careerPositions = careerPositions.set(career.id, CareerPosition.create(career));
        });

        let educations = this.educations;
        profileFromAPI.education.forEach(educationEntry => {
            let education: APIEducation = educationEntry.education;
            educations = educations.set(education.id, Education.create(education));
        });

        let sectors = this.sectors;
        profileFromAPI.sectors.forEach(sectorEntry => {
            let sector: APISector = sectorEntry.sector;
            sectors = sectors.set(sector.id, Sector.create(sector));
        });


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