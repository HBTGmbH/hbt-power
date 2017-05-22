import * as Immutable from 'immutable';
import {EducationEntry} from './EducationEntry';
import {LanguageSkill} from './LanguageSkill';
import {QualificationEntry} from './QualificationEntry';
import {TrainingEntry} from './TrainingEntry';
import {
    APICategory,
    APIEducationStep,
    APILanguageSkill,
    APIProfile,
    APIProject,
    APIQualificationEntry,
    APISectorEntry, APISkill,
    APITrainingEntry
} from './APIProfile';
import {isNullOrUndefined} from 'util';
import {InternalDatabase} from './InternalDatabase';
import {SectorEntry} from './SectorEntry';
import {Project} from './Project';
import {doop} from 'doop/built/doop';
import {SkillCategory} from './SkillCategory';
import {Skill} from './Skill';

/*
let c1: SkillCategory = new SkillCategory("1", "Anwendersoftware", Immutable.List<Skill>(), Immutable.List<SkillCategory>());
let c2: SkillCategory = new SkillCategory("2", "Software", Immutable.List<Skill>(), Immutable.List<SkillCategory>());
let c3: SkillCategory = new SkillCategory("3", "Entwicklung", Immutable.List<Skill>(), Immutable.List<SkillCategory>());
let c4: SkillCategory = new SkillCategory("4", "Programmiersprachen", Immutable.List<Skill>(), Immutable.List<SkillCategory>());

c1 = c1.skills(c1.skills().push(new Skill("Google Chrome", "1")));
c1 = c1.skills(c1.skills().push(new Skill("Firefox", "2")));
c1 = c1.skills(c1.skills().push(new Skill("Outlook", "3")));
c1 = c1.skills(c1.skills().push(new Skill("MS Excel", "4")));
c1 = c1.skills(c1.skills().push(new Skill("MS Office", "5")));
c1 = c1.skills(c1.skills().push(new Skill("Spotify", "6")));
c1 = c1.skills(c1.skills().push(new Skill("Postman", "7")));

c2 = c2.skills(c2.skills().push(new Skill("Kaspersky Internet Security", "8")));
c2 = c2.categories(c2.categories().push(c1));

c3 = c3.skills(c3.skills().push(new Skill("Unit Testing", "8")));
c3 = c3.skills(c3.skills().push(new Skill("Objektorientierte Programmierung", "9")));
c3 = c3.skills(c3.skills().push(new Skill("Funktionle Programmierung", "10")));
c3 = c3.skills(c3.skills().push(new Skill("Lasttests", "11")));
c3 = c3.skills(c3.skills().push(new Skill("SCRUM", "12")));
c3 = c3.skills(c3.skills().push(new Skill("Kanboard", "12")));
c3 = c3.skills(c3.skills().push(new Skill("Agile", "12")));

c4 = c4.skills(c4.skills().push(new Skill("Java EE", "12")));
c4 = c4.skills(c4.skills().push(new Skill("Java SE", "13")));
c4 = c4.skills(c4.skills().push(new Skill("Haskell", "14")));
c4 = c4.skills(c4.skills().push(new Skill("Erlang", "15")));
c4 = c4.skills(c4.skills().push(new Skill("C", "16")));
c4 = c4.skills(c4.skills().push(new Skill("C++", "17")));
c4 = c4.skills(c4.skills().push(new Skill("C#", "18")));
c4 = c4.skills(c4.skills().push(new Skill("Go", "19")));

root = root.categories(root.categories().push(c2));
root = root.categories(root.categories().push(c3));
root = root.categories(root.categories().push(c4));*/




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
    @doop
    public get skills() { return doop<Immutable.Map<string, Skill>, this>()};
    @doop
    public get categories() { return doop<Immutable.Map<string, SkillCategory>, this>()};
    @doop
    public get rootCategoryId() {return doop<string, this>()};

    constructor(
        id: number,
        currentPosition: string,
        description: string,
        sectorEntries: Immutable.Map<string, SectorEntry>,
        trainingEntries: Immutable.Map<string, TrainingEntry>,
        educationEntries: Immutable.Map<string, EducationEntry>,
        languageSkills: Immutable.Map<string, LanguageSkill>,
        qualificationEntries: Immutable.Map<string, QualificationEntry>,
        projects: Immutable.Map<string, Project>,
        skills: Immutable.Map<string, Skill>,
        categories: Immutable.Map<string, SkillCategory>,
        rootCategoryId: string
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
            .categories(categories)
            .rootCategoryId(rootCategoryId)

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
                res = res.set(sectorEntry.id(), sectorEntry);
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
                res = res.set(qualificationEntry.id(), qualificationEntry);
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
                res = res.set(careerElement.id(), careerElement);
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

    private static parseSkillFromCategory(category: APICategory, map: Immutable.Map<string, Skill>): Immutable.Map<string, Skill> {

        category.skills.forEach((apiSkill: APISkill) => {
            let skill: Skill = Skill.fromAPI(apiSkill);
            map = map.set(skill.id(), skill);
        });
        category.categories.forEach((cat: APICategory) => {
            map = Profile.parseSkillFromCategory(cat, map);
        });
        return map;
        /*
        category.categories.forEach((cat: APICategory) => {
            let category: SkillCategory = SkillCategory.fromAPI(cat);
        })*/
    }

    private static parseSkills(rootCategories: Array<APICategory>): Immutable.Map<string, Skill> {
        let res: Immutable.Map<string, Skill> = Immutable.Map<string, Skill>();
        rootCategories.forEach(apiCategory => {
            res = Profile.parseSkillFromCategory(apiCategory,res);
        });
        return res;
    }


    private static parseSingleCategory(apiCategory: APICategory, map:Immutable.Map<string, SkillCategory>): Immutable.Map<string, SkillCategory>{
        let category: SkillCategory = SkillCategory.fromAPI(apiCategory);
        map = map.set(category.id(), category);
        apiCategory.categories.forEach(apiCat => {
            map = Profile.parseSingleCategory(apiCat, map);
        });
        return map;
    }

    private static parseCategories(rootCategories: Array<APICategory>): Immutable.Map<string, SkillCategory> {
        let res: Immutable.Map<string, SkillCategory> = Immutable.Map<string, SkillCategory>();
        rootCategories.forEach(apiCat => {
            res = Profile.parseSingleCategory(apiCat, res);
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

        let rootCategories: Array<APICategory> = [];
        let rootCategory = this.getCategory(this.rootCategoryId());
        rootCategory.categoryIds().forEach(id => {
            rootCategories.push(this.getCategory(id).toAPI(this));
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
            rootCategories: rootCategories
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
        let root: SkillCategory = new SkillCategory("___root", "root", Immutable.Set<string>(), Immutable.List<string>());
        // set the root category correctly
        profile.rootCategories.forEach(rootCat => {
            root = root.categoryIds(root.categoryIds().push(String(rootCat.id)));
        });
        let categories =  Profile.parseCategories(profile.rootCategories);
        categories = categories.set(root.id(), root);
        return new Profile(
            Number(profile.id),
            profile.currentPosition,
            profile.description,
            Profile.parseSectors(profile.sectors),
            Profile.parseTrainingEntries(profile.trainingEntries),
            Profile.parseEducationEntries(profile.education),
            Profile.parseLanguageSkills(profile.languages),
            Profile.parseQualficiationEntries(profile.qualification),
            Profile.parseProjects(profile.projects),
            Profile.parseSkills(profile.rootCategories),
            categories,
            root.id()
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
            if(skill.name() == name) {
                res = skill;
                return true;
            }
            return false;
        });
        return res;
    }
    public getCategory(id: string): SkillCategory {
        return this.categories().get(id);
    }

    public getProject(id: string): Project {
        return this.projects().get(id);
    }

    private getNestedSkills(category: SkillCategory, skillIds: Array<string>) {
        category.skillIds().forEach(id => {
            skillIds.push(id);
        });
        category.categoryIds().forEach(id => {
            let cat: SkillCategory = this.getCategory(id);
            this.getNestedSkills(cat, skillIds);
        })
    }

    /**
     * Returns a list of skills that are in the category and all sub-categories
     * @param category
     */
    public getAllNestedSkillIds(category: SkillCategory): Array<string> {
        let res: Array<string> = [];
        this.getNestedSkills(category, res);
        return res;
    }

    /**
     * Adds a skill to the root categorie and returns a copy of this profile with the changed root.
     * @param skill
     */
    public addSkillToRoot(skill: Skill): Profile {
        let root: SkillCategory = this.getCategory(this.rootCategoryId());
        root = root.skillIds(root.skillIds().add(skill.id()));
        return this.categories(this.categories().set(root.id(), root));
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
        let root: SkillCategory = new SkillCategory("__root__", "root", Immutable.Set<string>(), Immutable.List<string>());
        return new Profile(
            -1,
            '',
            '',
            Immutable.Map<string, SectorEntry>(),
            Immutable.Map<string, TrainingEntry>(),
            Immutable.Map<string, EducationEntry>(),
            Immutable.Map<string, LanguageSkill>(),
            Immutable.Map<string, QualificationEntry>(),
            Immutable.Map<string, Project>(),
            Immutable.Map<string, Skill>(),
            Immutable.Map<string, SkillCategory>().set(root.id(), root),
            root.id()
        );
    }


}