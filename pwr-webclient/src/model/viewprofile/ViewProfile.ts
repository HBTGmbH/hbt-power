/**
 * Created by nt on 29.05.2017.
 */
import {doop} from 'doop';
import {Profile} from '../Profile';
import * as Immutable from 'immutable';
import {NEW_ENTITY_PREFIX} from '../PwrConstants';
import {ViewElement} from './ViewElement';
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

    private static currentId: number = 0;


    private constructor(id: string, isNew: boolean, name: string, description: string, profile: Profile,
                viewSectorEntries: Immutable.List<ViewElement>,
                viewTrainignEntries:Immutable.List<ViewElement>,
                viewEducationEntries:Immutable.List<ViewElement>,
                viewLanguageSkills: Immutable.List<ViewElement>,
                viewQualificationEntries: Immutable.List<ViewElement>,
    ) {
        return this.id(id).isNew(isNew).name(name).description(description).profile(profile).viewSectorEntries(viewSectorEntries)
            .viewTrainingEntries(viewTrainignEntries)
            .viewEducationEntries(viewEducationEntries)
            .viewLanguageEntries(viewLanguageSkills)
            .viewQualificationEntries(viewQualificationEntries)
    }

    public static createNewEmpty(profile: Profile) {

        return new ViewProfile(
            String(NEW_ENTITY_PREFIX + ViewProfile.currentId++),
            true,
            "",
            "",
            profile,
            Immutable.List<ViewElement>(profile.sectorEntries().map(val => ViewElement.create(true, val.id())).values()),
            Immutable.List<ViewElement>(profile.trainingEntries().map(val => ViewElement.create(true, val.id())).values()),
            Immutable.List<ViewElement>(profile.educationEntries().map(val => ViewElement.create(true, val.id())).values()),
            Immutable.List<ViewElement>(profile.languageSkills().map(val => ViewElement.create(true, val.id())).values()),
            Immutable.List<ViewElement>(profile.qualificationEntries().map(val => ViewElement.create(true, val.id())).values()),
        )
    }

    public static createNew(name: string, description: string, profile: Profile) {
        return ViewProfile.createNewEmpty(profile).name(name).description(description);
    }


}