import * as Immutable from 'immutable';
import {EducationEntry} from './EducationEntry';
import {LanguageSkill} from './LanguageSkill';
import {QualificationEntry} from './QualificationEntry';
import {TrainingEntry} from './TrainingEntry';
import {
    APICareerEntry,
    APIEducationEntry,
    APIKeySkill,
    APILanguageSkill,
    APIProfile,
    APIProject,
    APIQualificationEntry,
    APISectorEntry,
    APISkill,
    APITrainingEntry
} from './APIProfile';
import {isNullOrUndefined} from 'util';
import {ProfileStore} from './ProfileStore';
import {SectorEntry} from './SectorEntry';
import {Project} from './Project';
import {doop} from 'doop/built/doop';
import {Skill} from './Skill';
import {CareerEntry} from './CareerEntry';
import {KeySkillEntry} from './KeySkillEntry';


@doop
export class Profile {

    @doop
    public get id() {
        return doop<number, this>();
    };

    @doop
    public get currentPosition() {
        return doop<string, this>();
    }

    @doop
    public get description() {
        return doop<string, this>();
    }

    @doop
    public get sectorEntries() {
        return doop<Immutable.Map<string, SectorEntry>, this>();
    }

    @doop
    public get trainingEntries() {
        return doop<Immutable.Map<string, TrainingEntry>, this>();
    }

    @doop
    public get careerEntries() {
        return doop<Immutable.Map<string, CareerEntry>, this>();
    }

    @doop
    public get educationEntries() {
        return doop<Immutable.Map<string, EducationEntry>, this>();
    }

    @doop
    public get languageSkills() {
        return doop<Immutable.Map<string, LanguageSkill>, this>();
    }

    @doop
    public get qualificationEntries() {
        return doop<Immutable.Map<string, QualificationEntry>, this>();
    }

    @doop
    public get keySkillEntries() {
        return doop<Immutable.Map<string, KeySkillEntry>, this>();
    }

    /**
     * Projects by id
     */
    @doop
    public get projects() {
        return doop<Immutable.Map<string, Project>, this>();
    }

    /**
     * Skills by id
     */
    @doop
    public get skills() {
        return doop<Immutable.Map<string, Skill>, this>();
    };

    @doop
    public get lastEdited() {
        return doop<Date, this>();
    }

    @doop
    public get lastEditedBy() {
        return doop<string, this>();
    }

    /**
     * Changes made to the profile since the last save operation was performed.
     */
    @doop
    public get changesMade() {
        return doop<number, this>();
    }


    constructor(
        id: number,
        currentPosition: string,
        description: string,
        sectorEntries: Immutable.Map<string, SectorEntry>,
        trainingEntries: Immutable.Map<string, TrainingEntry>,
        careerEntries: Immutable.Map<string, CareerEntry>,
        educationEntries: Immutable.Map<string, EducationEntry>,
        languageSkills: Immutable.Map<string, LanguageSkill>,
        qualificationEntries: Immutable.Map<string, QualificationEntry>,
        keySkillEntries: Immutable.Map<string, KeySkillEntry>,
        projects: Immutable.Map<string, Project>,
        skills: Immutable.Map<string, Skill>,
        lastEdited: Date,
        lastEditedBy: string,
        changesMade: number
    ) {
        return this.id(id)
            .currentPosition(currentPosition)
            .description(description)
            .sectorEntries(sectorEntries)
            .trainingEntries(trainingEntries)
            .educationEntries(educationEntries)
            .languageSkills(languageSkills)
            .qualificationEntries(qualificationEntries)
            .projects(projects)
            .skills(skills)
            .lastEdited(lastEdited)
            .lastEditedBy(lastEditedBy)
            .careerEntries(careerEntries)
            .keySkillEntries(keySkillEntries)
            .changesMade(changesMade);

    }


    // == Non-mutating update functions == //


    // == Serialization & Deserialization == //

    private static parseSectors(sectors: Array<APISectorEntry>): Immutable.Map<string, SectorEntry> {
        let res: Immutable.Map<string, SectorEntry> = Immutable.Map<string, SectorEntry>();
        sectors.forEach(apiSectorEntry => {
            // In case the API returns something invalid.
            if (!isNullOrUndefined(apiSectorEntry)) {
                // We assume that the server that provides the data is always right, which means the
                // client is missing a data set.
                // This adds the sector to the currently known sectorEntries.
                let sectorEntry: SectorEntry = SectorEntry.create(apiSectorEntry);
                res = res.set(sectorEntry.id(), sectorEntry);
            }
        });
        return res;
    }

    private static parseLanguageSkills(langSkills: Array<APILanguageSkill>): Immutable.Map<string, LanguageSkill> {
        let res: Immutable.Map<string, LanguageSkill> = Immutable.Map<string, LanguageSkill>();
        langSkills.forEach(apiLangSkill => {
            // In case the API returns something invalid.
            if (!isNullOrUndefined(apiLangSkill)) {
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
            if (!isNullOrUndefined(apiQualificationEntry)) {
                let qualificationEntry: QualificationEntry = QualificationEntry.fromAPI(apiQualificationEntry);
                res = res.set(qualificationEntry.id(), qualificationEntry);
            }
        });
        return res;
    }

    private static parseTrainingEntries(career: Array<APITrainingEntry>): Immutable.Map<string, TrainingEntry> {
        let res = Immutable.Map<string, TrainingEntry>();
        career.forEach(apiTrainingEntry => {
            // The API might return something invalid. Ignore.
            if (!isNullOrUndefined(apiTrainingEntry)) {
                let careerElement: TrainingEntry = TrainingEntry.fromAPI(apiTrainingEntry);
                res = res.set(careerElement.id(), careerElement);
            }
        });
        return res;
    }

    /**
     *
     * @param educationEntries
     */
    private static parseEducationEntries(educationEntries: Array<APIEducationEntry>): Immutable.Map<string, EducationEntry> {
        let res: Immutable.Map<string, EducationEntry> = Immutable.Map<string, EducationEntry>();
        educationEntries.forEach(apiEducationEntry => {
            // The API might return something invalid. Ignore that.
            if (!isNullOrUndefined(apiEducationEntry)) {
                let educationEntry: EducationEntry = EducationEntry.fromAPI(apiEducationEntry);
                res = res.set(educationEntry.id(), educationEntry);
            }
        });
        return res;
    }

    private static parseProjects(projects: Array<APIProject>): Immutable.Map<string, Project> {
        let res: Immutable.Map<string, Project> = Immutable.Map<string, Project>();
        projects.forEach(apiProject => {
            if (!isNullOrUndefined(apiProject)) {
                let project: Project = Project.fromAPI(apiProject);
                res = res.set(project.id(), project);
            }
        });
        return res;
    }

    private static parseSkills(skills: Array<APISkill>): Immutable.Map<string, Skill> {
        skills.sort((a, b) => a.name.localeCompare(b.name));
        let res: Immutable.Map<string, Skill> = Immutable.Map<string, Skill>();
        skills.forEach(skill => {
            res = res.set(String(skill.id), Skill.fromAPI(skill));
        });
        return res;
    }

    private static parseCareerEntries(careerEntries: Array<APICareerEntry>): Immutable.Map<string, CareerEntry> {
        let res: Immutable.Map<string, CareerEntry> = Immutable.Map<string, CareerEntry>();
        careerEntries.forEach(apiCareerEntry => {
            if (!isNullOrUndefined(apiCareerEntry)) {
                let careerEntry: CareerEntry = CareerEntry.fromAPI(apiCareerEntry);
                res = res.set(careerEntry.id(), careerEntry);
            }
        });
        return res;
    }

    private static parseKeySkills(apiKeySkills: Array<APIKeySkill>): Immutable.Map<string, KeySkillEntry> {
        let res: Immutable.Map<string, KeySkillEntry> = Immutable.Map<string, KeySkillEntry>();
        apiKeySkills.forEach(apiKeySkill => {
            if (!isNullOrUndefined(apiKeySkill)) {
                let keySkill: KeySkillEntry = KeySkillEntry.fromAPI(apiKeySkill);
                res = res.set(keySkill.id(), keySkill);
            }
        });
        return res;
    }


    public serializeToApiProfile(database: ProfileStore): APIProfile {
        // Maps all career elements into an API format
        let training: Array<APITrainingEntry> = [];
        this.trainingEntries().forEach(trainingEntry => {
            training.push(trainingEntry.toAPICareer(database.trainings()));
        });

        // Maps all education steps into an API format.
        let educations: Array<APIEducationEntry> = [];
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
            projects.push(project.toAPI(database.companies(), database.projectRoles(), this.skills()));
        });

        let skills: Array<APISkill> = [];
        this.skills().forEach(skill => {
            skills.push(skill.toAPI());
        });

        let careerEntries: Array<APICareerEntry> = [];
        this.careerEntries().forEach(careerEntry => {
            careerEntries.push(careerEntry.toAPI(database.careers()));
        });

        let keySkillEntries: Array<APIKeySkill> = [];
        this.keySkillEntries().forEach(keySkill => {
            keySkillEntries.push(keySkill.toAPI(database.keySkills()));
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
            projects: projects,
            skills: skills,
            lastEdited: null,
            careerEntries: careerEntries,
            keySkillEntries: keySkillEntries
        };
        console.debug('Serialized profile:', res);
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
            Profile.parseCareerEntries(profile.careerEntries),
            Profile.parseEducationEntries(profile.education),
            Profile.parseLanguageSkills(profile.languages),
            Profile.parseQualficiationEntries(profile.qualification),
            Profile.parseKeySkills(profile.keySkillEntries),
            Profile.parseProjects(profile.projects),
            Profile.parseSkills(profile.skills),
            new Date(profile.lastEdited),
            '',
            0
        );
    }

    public getSkillName(id: string): string {
        return this.skills().get(id).name();
    }

    public getSkill(id: string): Skill {

        return this.skills().get(id);
    }

    public getSkillByName(name: string): Skill {
        let res: Skill = null;
        this.skills().some((skill: Skill, key: string) => {
            if (skill.name() == name) {
                res = skill;
                return true;
            }
            return false;
        });
        return res;
    }

    public getProject(id: string): Project {
        return this.projects().get(id);
    }


    public getLanguageSkillsByNameId(nameId: string): LanguageSkill {
        return this.languageSkills().find(o => o.languageId() == nameId);
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
            Immutable.Map<string, CareerEntry>(),
            Immutable.Map<string, EducationEntry>(),
            Immutable.Map<string, LanguageSkill>(),
            Immutable.Map<string, QualificationEntry>(),
            Immutable.Map<string, KeySkillEntry>(),
            Immutable.Map<string, Project>(),
            Immutable.Map<string, Skill>(),
            new Date(),
            '',
            0
        );
    }


}
