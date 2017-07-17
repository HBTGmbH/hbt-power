/**
 * Created by nt on 29.05.2017.
 */
import {doop} from 'doop';
import {Profile} from '../Profile';
import * as Immutable from 'immutable';
import {ViewElement} from './ViewElement';
import {APIViewProfile} from './APIViewProfile';
/**
 * References a {@link Profile}, but stores only a subset of its data in an ordered way.
 */
@doop
export class ViewProfile {

    /**
     * Technical ID
     * @returns {Doop<string, ViewProfile>}
     */
    @doop
    public get id() {return doop<string, ViewProfile>()}

    @doop
    public get isNew() {return doop<boolean, ViewProfile>()};

    /**
     *
     * @returns {Doop<string, ViewProfile>}
     */
    @doop
    public get name() {return doop<string, ViewProfile>()};

    @doop
    public get description() {return doop<string, ViewProfile>()};

    /**
     * The referenced profile.
     * @returns {Doop<Profile, ViewProfile>}
     */
    @doop
    public get profile() {return doop<Profile, ViewProfile>()};

    @doop
    public get creationDate() {return doop<Date, ViewProfile>()};

    @doop
    public get viewSectorEntries() {return doop<Immutable.List<ViewElement>, ViewProfile>()};

    @doop
    public get viewTrainingEntries() {return doop<Immutable.List<ViewElement>, ViewProfile>()};

    @doop
    public get viewEducationEntries() {return doop<Immutable.List<ViewElement>, ViewProfile>()};

    /**
     * Ordered List of language IDs referencing {@link Profile#languageSkills}
     * @returns {Doop<Immutable.List<string>, ViewProfile>}
     */
    @doop
    public get viewLanguageEntries() {return doop<Immutable.List<ViewElement>, ViewProfile>()};

    @doop
    public get viewQualificationEntries() {return doop<Immutable.List<ViewElement>, ViewProfile>()};

    @doop
    public get viewKeySkills() {return doop<Immutable.List<ViewElement>, ViewProfile>()};

    @doop
    public get viewCareerEntries() {return doop<Immutable.List<ViewElement>, ViewProfile>()};

    @doop
    public get viewSkills() {return doop<Immutable.List<ViewElement>, ViewProfile>()};

    @doop
    public get viewProjects() {return doop<Immutable.List<ViewElement>, ViewProfile>()};


    private static currentId: number = 0;


    private constructor(id: string, isNew: boolean, name: string, description: string, profile: Profile, creationDate: Date,
                viewSectorEntries: Immutable.List<ViewElement>,
                viewTrainignEntries:Immutable.List<ViewElement>,
                viewEducationEntries:Immutable.List<ViewElement>,
                viewLanguageSkills: Immutable.List<ViewElement>,
                viewQualificationEntries: Immutable.List<ViewElement>,
                viewProjects: Immutable.List<ViewElement>,
                viewKeySkills: Immutable.List<ViewElement>,
                viewCareerEntries: Immutable.List<ViewElement>,
                viewSkills: Immutable.List<ViewElement>,
    ) {
        return this.id(id).isNew(isNew).name(name).description(description).profile(profile).viewSectorEntries(viewSectorEntries)
            .viewTrainingEntries(viewTrainignEntries)
            .viewEducationEntries(viewEducationEntries)
            .viewLanguageEntries(viewLanguageSkills)
            .viewQualificationEntries(viewQualificationEntries)
            .viewProjects(viewProjects)
            .creationDate(creationDate)
            .viewKeySkills(viewKeySkills)
            .viewCareerEntries(viewCareerEntries)
            .viewSkills(viewSkills)
    }


    public static fromAPI(apiViewProfile: APIViewProfile) {
        return new ViewProfile(
            String(apiViewProfile.id),
            false,
            apiViewProfile.name,
            apiViewProfile.description,
            Profile.createFromAPI(apiViewProfile.profileSnapshot),
            new Date(apiViewProfile.creationDate),
            Immutable.List<ViewElement>(apiViewProfile.sectorViewEntries.map(ViewElement.fromAPIViewSector)),
            Immutable.List<ViewElement>(apiViewProfile.trainingViewEntries.map(ViewElement.fromAPIViewTraining)),
            Immutable.List<ViewElement>(apiViewProfile.educationViewEntries.map(ViewElement.fromAPIViewEducation)),
            Immutable.List<ViewElement>(apiViewProfile.languageViewEntries.map(ViewElement.fromAPIViewLanguage)),
            Immutable.List<ViewElement>(apiViewProfile.qualificationViewEntries.map(ViewElement.fromAPIViewQualification)),
            Immutable.List<ViewElement>(apiViewProfile.projectViewEntries.map(ViewElement.fromAPIViewProject)),
            Immutable.List<ViewElement>(apiViewProfile.keySkillViewEntries.map(ViewElement.fromAPIViewKeySkill)),
            Immutable.List<ViewElement>(apiViewProfile.careerViewEntries.map(ViewElement.fromAPIViewCareer)),
            Immutable.List<ViewElement>(apiViewProfile.skillViewEntries.map(ViewElement.fromAPIViewSkill))
        )
    }


}