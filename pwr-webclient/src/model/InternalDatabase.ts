import {NameEntity} from './NameEntity';
import {ProfileElementType, RequestStatus} from '../Store';
import * as Immutable from 'immutable';
import {APIProfile} from './APIProfile';
import {Profile} from './Profile';
import {doop} from 'doop';


/**
 * Internal databaseReducer that avoids deeply nested structures by unwrapping them, saving entities in seperate arrays
 * instead of nested arrays in their respective entities.
 *
 * Entities itself are stored in associative arrays, and may be accessed in the following manner: <code>entitiesById[myEntity.id]</code>
 * To allow fast iteration over all entities in one of these associative arrays, a second array exists for each entity.
 * This array stores all currently available entity IDs.
 */
@doop
export class InternalDatabase {

    @doop
    public get APIRequestStatus() {return doop<RequestStatus, this>()}

    @doop
    public get languageLevels() {return doop<Array<string>, this>()};

    @doop
    public get degrees() {return doop<Immutable.List<string>, this>()}

    @doop
    public get loggedInUser() {return doop<string, this>()};

    @doop
    public get profile() {return doop<Profile, this>()};

    @doop
    public get trainings() {return doop<Immutable.Map<string, NameEntity>, this>()}

    @doop
    public get educations() {return doop<Immutable.Map<string, NameEntity>, this>()}

    @doop
    public get languages() {return doop<Immutable.Map<string, NameEntity>, this>()}

    @doop
    public get sectors() {return doop<Immutable.Map<string, NameEntity>, this>()}

    @doop
    public get qualifications() {return doop<Immutable.Map<string, NameEntity>, this>()}

    @doop
    public get companies() {return doop<Immutable.Map<string, NameEntity>, this>()}

    @doop
    public get projectRoles() {return doop<Immutable.Map<string, NameEntity>, this>()}


    constructor(
        apiRequestStatus: RequestStatus,
        languageLevels: Array<string>,
        profile: Profile,
        trainings: Immutable.Map<string, NameEntity>,
        educations: Immutable.Map<string, NameEntity>,
        languages: Immutable.Map<string, NameEntity>,
        qualifications: Immutable.Map<string, NameEntity>,
        sectors:  Immutable.Map<string, NameEntity>,
        companies: Immutable.Map<string, NameEntity>,
        projectRoles: Immutable.Map<string, NameEntity>,
        loggedInUser: string,
        degrees: Immutable.List<string>
) {
        return this.APIRequestStatus(apiRequestStatus)
            .languageLevels(languageLevels)
            .profile(profile)
            .trainings(trainings)
            .educations(educations)
            .languages(languages)
            .qualifications(qualifications)
            .sectors(sectors)
            .companies(companies)
            .projectRoles(projectRoles)
            .loggedInUser(loggedInUser)
            .degrees(degrees)
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
            Immutable.Map<string, NameEntity>(),
            Immutable.Map<string, NameEntity>(),
            Immutable.Map<string, NameEntity>(),
            "jd",
            Immutable.List<string>(["Bachelor", "Master", "Doktor"])
        )
    }

    public findNameEntityByName(name: string, type: ProfileElementType): NameEntity {
        let lookup: Immutable.Map<string, NameEntity>;
        switch(type) {
            case ProfileElementType.SectorEntry:
                lookup = this.sectors();
                break;
            case ProfileElementType.QualificationEntry:
                lookup = this.qualifications();
                break;
            case ProfileElementType.LanguageEntry:
                lookup = this.languages();
                break;
            case ProfileElementType.EducationEntry:
                lookup = this.educations();
                break;
            case ProfileElementType.TrainingEntry:
                lookup = this.trainings();
                break;
            default:
                throw Error("unknown NameEntityType.");
        }
        return InternalDatabase.findNameEntityByName(name, lookup);
    }

    public static findNameEntityByName(name: string, lookup: Immutable.Map<string, NameEntity>): NameEntity {

        let result: NameEntity = null;
        lookup.some((value, key, iter) => {
            if (value.name() === name) {
                result = value;
                return true;
            }
            return false;
        });
        return result;
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
        let languages = this.languages();
        profileFromAPI.languages.forEach(langSkill => {
            let l: NameEntity = NameEntity.fromAPI(langSkill.language);
            languages = languages.set(l.id(), l);
        });
        console.info("...done.");
        console.info("Parsing qualifications...");
        let qualifications = this.qualifications();
        profileFromAPI.qualification.forEach(qualificationEntry => {
           let q: NameEntity = NameEntity.fromAPI(qualificationEntry.qualification);
           qualifications = qualifications.set(q.id(), q);
        });
        console.info("...done.");
        console.info("Parsing trainings...");
        let trainings = this.trainings();
        profileFromAPI.trainingEntries.forEach(trainingEntry => {
            let training: NameEntity = NameEntity.fromAPI(trainingEntry.training);
            trainings = trainings.set(training.id(), training);
        });
        console.info("...done.");
        console.info("Parsing educations...");
        let educations = this.educations();
        profileFromAPI.education.forEach(educationEntry => {
            let education: NameEntity = NameEntity.fromAPI(educationEntry.education);
            educations = educations.set(education.id(), education);
        });
        console.info("...done.");
        console.info("Parsing sectorEntries...");
        let sectors = this.sectors();
        profileFromAPI.sectors.forEach(sectorEntry => {
            let sector: NameEntity = NameEntity.fromAPI(sectorEntry.sector);
            sectors = sectors.set(sector.id(), sector);
        });
        console.info("...done.");
        console.info("Parsing companies...");
        let companies = this.companies();
        profileFromAPI.projects.forEach(project => {
            let company: NameEntity = NameEntity.fromAPI(project.broker);
            companies = companies.set(company.id(), company);
        });
        console.info("...done");
        console.info("Parsing project roles...");
        let projectRoles = this.projectRoles();
        profileFromAPI.projects.forEach(project => {
            project.projectRole.forEach(apiRole => {
                let role: NameEntity = NameEntity.fromAPI(apiRole);
                projectRoles = projectRoles.set(role.id(), role);
            })
        });
        console.info("..done");
        console.info("Parsing profile...");
        let profile: Profile = Profile.createFromAPI(profileFromAPI);
        console.info("...done");

        return this.profile(profile)
            .trainings(trainings)
            .educations(educations)
            .languages(languages)
            .qualifications(qualifications)
            .sectors(sectors)
            .companies(companies)
            .projectRoles(projectRoles);
    }



    /**
     * Deserializes this database into an API profile that may be sent back to the server for an
     * update command.
     */
    public serializeToAPI(): APIProfile {
        // TODO this needs some refactoring:
        // - Suggestions into an own 'database'
        // - Profile has access to database
        return this.profile().serializeToApiProfile(this);
    }



}