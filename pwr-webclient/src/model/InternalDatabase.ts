import {NameEntity} from './NameEntity';
import {ProfileElementType, RequestStatus} from '../Store';
import * as Immutable from 'immutable';
import {APINameEntity, APIProfile} from './APIProfile';
import {Profile} from './Profile';


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

    public languageLevels: Array<string> = ["BASIC", "ADVANCED", "BUSINESS_FLUENT", "NATIVE"];

    public readonly degrees: Immutable.List<string> = Immutable.List<string>(["Bachelor", "Master", "Doktor"]);

    public readonly loggedInUser: string = "jd";

    public readonly profile: Profile;

    public readonly trainings : Immutable.Map<string, NameEntity> = Immutable.Map<string, NameEntity>();

    public readonly educations: Immutable.Map<string, NameEntity> = Immutable.Map<string, NameEntity>();

    public readonly languages: Immutable.Map<string, NameEntity> = Immutable.Map<string, NameEntity>();

    public readonly sectors: Immutable.Map<string, NameEntity> = Immutable.Map<string, NameEntity>();

    public readonly qualifications: Immutable.Map<string, NameEntity> = Immutable.Map<string, NameEntity>();


    constructor(
        apiRequestStatus: RequestStatus,
        languageLevels: Array<string>,
        profile: Profile,
        careerPositions: Immutable.Map<string, NameEntity>,
        educations: Immutable.Map<string, NameEntity>,
        languages: Immutable.Map<string, NameEntity>,
        qualifications: Immutable.Map<string, NameEntity>,
        sectors:  Immutable.Map<string, NameEntity>
) {
        this.APIRequestStatus = apiRequestStatus;
        this.languageLevels = languageLevels;
        this.profile = profile;
        this.trainings = careerPositions;
        this.educations = educations;
        this.languages = languages;
        this.qualifications = qualifications;
        this.sectors = sectors;
    }

    public static createWithDefaults(): InternalDatabase {
        let langs = Immutable.Map<string, NameEntity>();
        return new InternalDatabase(
            RequestStatus.Successful,
            ["BASIC", "ADVANCED", "BUSINESS_FLUENT", "NATIVE"],
            Profile.createDefault(),
            Immutable.Map<string, NameEntity>(),
            Immutable.Map<string, NameEntity>(),
            Immutable.Map<string, NameEntity>(),
            Immutable.Map<string, NameEntity>(),
            Immutable.Map<string, NameEntity>()
        )
    }

    public getNameEntityByName(name: string, type: ProfileElementType): NameEntity {
        let lookup: Immutable.Map<string, NameEntity>;
        switch(type) {
            case ProfileElementType.SectorEntry:
                lookup = this.sectors;
                break;
            case ProfileElementType.QualificationEntry:
                lookup = this.qualifications;
                break;
            case ProfileElementType.LanguageEntry:
                lookup = this.languages;
                break;
            case ProfileElementType.EducationEntry:
                lookup = this.educations;
                break;
            case ProfileElementType.TrainingEntry:
                lookup = this.trainings;
                break;
            default:
                throw Error("unknown NameEntityType.");
        }
        return InternalDatabase.getNameEntityByName(name, lookup);
    }

    public static getNameEntityByName(name: string, lookup: Immutable.Map<string, NameEntity>): NameEntity {

        let result: NameEntity = null;
        lookup.some((value, key, iter) => {
            if (value.name === name) {
                result = value;
                return true;
            }
            return false;
        });
        return result;
    }


    public changeAPIRequestStatus(newStatus: RequestStatus): InternalDatabase {
        return new InternalDatabase(
            newStatus,
            this.languageLevels,
            this.profile,
            this.trainings,
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
            this.trainings,
            this.educations,
            this.languages,
            this.qualifications,
            this.sectors
        )
    }

    public updateEducation(education: NameEntity): InternalDatabase {
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            this.trainings,
            this.educations.set(education.id, education),
            this.languages,
            this.qualifications,
            this.sectors
        );

    }

    public updateLanguage(language: NameEntity) : InternalDatabase {
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            this.trainings,
            this.educations,
            this.languages.set(language.id, language),
            this.qualifications,
            this.sectors
        );
    }

    public updateQualification(qualification: NameEntity): InternalDatabase {
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            this.trainings,
            this.educations,
            this.languages,
            this.qualifications.set(qualification.id, qualification),
            this.sectors
        )
    };

    public updateSector(sector: NameEntity): InternalDatabase {
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            this.trainings,
            this.educations,
            this.languages,
            this.qualifications,
            this.sectors.set(sector.id, sector)
        )
    }

    public updateTraining(training: NameEntity): InternalDatabase {
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            this.trainings.set(training.id, training),
            this.educations,
            this.languages,
            this.qualifications,
            this.sectors
        )
    }

    private static addAPINameEntities(names: Array<APINameEntity>, reference: Immutable.Map<string, NameEntity>): Immutable.Map<string, NameEntity> {
        let res: Immutable.Map<string, NameEntity> = reference;
        names.forEach(apiName => {
            let name: NameEntity = NameEntity.fromAPI(apiName);
            res = res.set(name.id, name);
        });
        return res;
    }

    /**
     * Non-mutating function that adds all given languages into the {@link InternalDatabase.languages} map.
     * @param languages to add into the map
     * @returns {InternalDatabase} copy of the old {@link InternalDatabase} in which the languages are modified.
     */
    public addAPILanguages(languages: Array<APINameEntity>): InternalDatabase {
        console.info("Receiving additional languages: ", languages);
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            this.trainings,
            this.educations,
            InternalDatabase.addAPINameEntities(languages, this.languages),
            this.qualifications,
            this.sectors
        )
    }

    public addAPIEducations(educations: Array<APINameEntity>): InternalDatabase {
        console.info("Receiving additional educations:", educations);
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            this.trainings,
            InternalDatabase.addAPINameEntities(educations, this.educations),
            this.languages,
            this.qualifications,
            this.sectors
        )
    }

    public addAPIQualifications(qualifications: Array<APINameEntity>) {
        console.info("Receiving additional qualifications:", qualifications);
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            this.trainings,
            this.educations,
            this.languages,
            InternalDatabase.addAPINameEntities(qualifications, this.qualifications),
            this.sectors
        )
    }

    public addAPITrainings(trainings: Array<APINameEntity>) {
        console.info("Receiving additional trainings:", trainings);
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            InternalDatabase.addAPINameEntities(trainings, this.trainings),
            this.educations,
            this.languages,
            this.qualifications,
            this.sectors
        )
    }

    public addAPISectors(sectors: Array<APINameEntity>) {
        console.info("Receiving additional sectorEntries:", sectors);
        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            this.profile,
            this.trainings,
            this.educations,
            this.languages,
            this.qualifications,
            InternalDatabase.addAPINameEntities(sectors, this.sectors)
        )
    }

    /**
     * Attempts to interprete a full consultant profile and parses it into the databaseReducer.
     * @param profileFromAPI the profile the API provides.
     */
    public parseProfile(profileFromAPI: APIProfile): InternalDatabase {

        console.info("Parsing received profile: ", profileFromAPI);
        console.info("Adding Profile information into suggestion database.");

        // references to the readonly property to modify it.
        // This will not affect the original languages, as the original is still immutable.
        console.info("Parsing languages...");
        let languages = this.languages;
        profileFromAPI.languages.forEach(langSkill => {
            let l: NameEntity = NameEntity.fromAPI(langSkill.language);
            languages = languages.set(l.id, l);
        });
        console.info("...done.");
        console.info("Parsing qualifications...");
        let qualifications = this.qualifications;
        profileFromAPI.qualification.forEach(qualificationEntry => {
           let q: NameEntity = NameEntity.fromAPI(qualificationEntry.qualification);
           qualifications = qualifications.set(q.id, q);
        });
        console.info("...done.");
        console.info("Parsing trainings...");
        let trainings = this.trainings;
        profileFromAPI.trainingEntries.forEach(trainingEntry => {
            let training: NameEntity = NameEntity.fromAPI(trainingEntry.training);
            trainings = trainings.set(training.id, training);
        });
        console.info("...done.");
        console.info("Parsing educations...");
        let educations = this.educations;
        profileFromAPI.education.forEach(educationEntry => {
            let education: NameEntity = NameEntity.fromAPI(educationEntry.education);
            educations = educations.set(education.id, education);
        });
        console.info("...done.");
        console.info("Parsing sectorEntries...");
        let sectors = this.sectors;
        profileFromAPI.sectors.forEach(sectorEntry => {
            let sector: NameEntity = NameEntity.fromAPI(sectorEntry.sector);
            sectors = sectors.set(sector.id, sector);
        });
        console.info("...done.");
        console.info("Parsing profile...");
        let profile: Profile = Profile.createFromAPI(profileFromAPI);
        console.info("...done");

        return new InternalDatabase(
            this.APIRequestStatus,
            this.languageLevels,
            profile,
            trainings,
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