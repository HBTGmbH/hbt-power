import * as Immutable from 'immutable';
import {EducationEntry} from './EducationEntry';
import {LanguageSkill} from './LanguageSkill';
import {QualificationEntry} from './QualificationEntry';
import {TrainingEntry} from './TrainingEntry';
import {
    APIEducationStep,
    APILanguageSkill,
    APIProfile,
    APIProject,
    APIQualificationEntry,
    APISectorEntry,
    APITrainingEntry
} from './APIProfile';
import {isNullOrUndefined} from 'util';
import {InternalDatabase} from './InternalDatabase';
import {SectorEntry} from './SectorEntry';
import {Project} from './Project';
import {doop} from 'doop/built/doop';

@doop
export class Profile {

    @doop
    public get id(){ return doop<number, this>();};
    @doop
    public get currentPosition(){ return doop<string, this>();}
    @doop
    public get description(){ return doop<string, this>();}
    @doop
    public get sectorEntries(){ return doop<Immutable.Map<string, SectorEntry>, this>();}
    @doop
    public get trainingEntries(){ return doop<Immutable.Map<string, TrainingEntry>, this>();}
    @doop
    public get educationEntries(){ return doop<Immutable.Map<string, EducationEntry>, this>();}
    @doop
    public get languageSkills(){ return doop<Immutable.Map<string, LanguageSkill>, this>();}
    @doop
    public get qualificationEntries(){ return doop<Immutable.Map<string, QualificationEntry>, this>();}
    @doop
    public get projects(){ return doop<Immutable.Map<string, Project>, this>();}

    constructor(
        id: number,
        currentPosition: string,
        description: string,
        sectorEntries: Immutable.Map<string, SectorEntry>,
        trainingEntries: Immutable.Map<string, TrainingEntry>,
        educationEntries: Immutable.Map<string, EducationEntry>,
        languageSkills: Immutable.Map<string, LanguageSkill>,
        qualificationEntries: Immutable.Map<string, QualificationEntry>,
        projects: Immutable.Map<string, Project>
    ) {
        return this.id(id)
            .currentPosition(currentPosition)
            .description(description)
            .sectorEntries(sectorEntries)
            .trainingEntries(trainingEntries)
            .educationEntries(educationEntries)
            .languageSkills(languageSkills)
            .qualificationEntries(qualificationEntries)
            .projects(projects);
    }


    // == Non-mutating update functions == //


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
                res = res.set(langSkill.id(), langSkill);
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
                res = res.set(educationEntry.id(), educationEntry);
            }
        });
        return res;
    }

    private static parseProjects(projects: Array<APIProject>): Immutable.Map<string, Project> {
        let res: Immutable.Map<string, Project> = Immutable.Map<string, Project>();
        projects.forEach(apiProject => {
            if(!isNullOrUndefined(apiProject)){
                let project: Project = Project.fromAPI(apiProject);
                res = res.set(project.id(), project);
            }
        });
        return res;
    }

    // FIXME do not require database anymore, or refactor database so it doesn't contain
    // FIXME this profile anymore.
    public serializeToApiProfile(database: InternalDatabase): APIProfile {
        // Maps all career elements into an API format
        let training: Array<APITrainingEntry> = [];
        this.trainingEntries().forEach(trainingEntry => {
            training.push(trainingEntry.toAPICareer(database.trainings()));
        });

        // Maps all education steps into an API format.
        let educations: Array<APIEducationStep> = [];
        this.educationEntries().forEach(educationEntry => {
            educations.push(educationEntry.toAPIEducationEntry(database.educations()));
        });

        let languages: Array<APILanguageSkill> = [];
        this.languageSkills().forEach(languageSkill => {
            languages.push(languageSkill.toAPILanguageSkill(database.languages()));
        });


        let qualifications: Array<APIQualificationEntry> = [];
        this.qualificationEntries().forEach(qualificationEntry => {
            qualifications.push(qualificationEntry.toAPIQualificationEntry(database.qualifications()));
        });

        let sectors: Array<APISectorEntry> = [];
        this.sectorEntries().forEach(sector => {
            sectors.push(sector.toAPISectorEntry(database.sectors()));
        });

        let projects: Array<APIProject> = [];
        this.projects().forEach(project => {
            projects.push(project.toAPI(database.companies(), database.projectRoles()));
        });

        let res: APIProfile = {
            id: this.id(),
            description: this.description(),
            currentPosition: this.currentPosition(),
            trainingEntries: training,
            languages: languages,
            qualification: qualifications,
            education: educations,
            sectors: sectors,
            projects: projects
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
            Profile.parseQualficiationEntries(profile.qualification),
            Profile.parseProjects(profile.projects)
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
            Immutable.Map<string, QualificationEntry>(),
            Immutable.Map<string, Project>()
        );
    }


}