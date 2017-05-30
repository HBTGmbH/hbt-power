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
    public get profileId() {return doop<number, ViewProfile>()};

    @doop
    public get viewSectorEntries() {return doop<Immutable.Map<string, ViewElement>, ViewProfile>()};

    @doop
    public get viewTrainingEntries() {return doop<Immutable.Map<string, ViewElement>, ViewProfile>()};

    @doop
    public get educationEntryIds() {return doop<Immutable.OrderedSet<string>, ViewProfile>()};

    /**
     * Ordered List of language IDs referencing {@link Profile#languageSkills}
     * @returns {Doop<Immutable.List<string>, ViewProfile>}
     */
    @doop
    public get viewLanguageEntries() {return doop<Immutable.Map<string, ViewElement>, ViewProfile>()};

    @doop
    public get viewQualificationEntries() {return doop<Immutable.Map<string, ViewElement>, ViewProfile>()};

    @doop
    public get viewProjectIds() {return doop<Immutable.Map<string, ViewElement>, ViewProfile>()};

    @doop
    public get viewSkillIds() {return doop<Immutable.Map<string, ViewElement>, ViewProfile>()};

    private static currentId: number = 0;


    private constructor(id: string, isNew: boolean, name: string, description: string, profileId: number,
                sectorEntryIds: Immutable.Map<string, ViewElement>,
                trainingEntryIds:Immutable.Map<string, ViewElement>,
                educationEntryIds:Immutable.OrderedSet<string>,
                languageSkillIds: Immutable.Map<string, ViewElement>,
                qualificationEntryIds: Immutable.Map<string, ViewElement>,
                projectIds: Immutable.Map<string, ViewElement>,
                skillIds: Immutable.Map<string, ViewElement>
    ) {
        return this.id(id).isNew(isNew).name(name).description(description).profileId(profileId).viewSectorEntries(sectorEntryIds)
            .viewTrainingEntries(trainingEntryIds)
            .educationEntryIds(educationEntryIds)
            .viewLanguageEntries(languageSkillIds)
            .viewQualificationEntries(qualificationEntryIds)
            .viewProjectIds(projectIds)
            .viewSkillIds(skillIds)
    }

    public static createNewEmpty(profile: Profile) {

        return new ViewProfile(
            String(NEW_ENTITY_PREFIX + ViewProfile.currentId++),
            true,
            "",
            "",
            profile.id(),
            Immutable.Map<string, ViewElement>(profile.sectorEntries().map(val => ViewElement.create(true))),
            Immutable.Map<string, ViewElement>(profile.trainingEntries().map(val => ViewElement.create(true))),
            Immutable.OrderedSet<string>(profile.educationEntries().map(val => val.id())),
            Immutable.Map<string, ViewElement>(profile.languageSkills().map(val => ViewElement.create(true))),
            Immutable.Map<string, ViewElement>(profile.qualificationEntries().map(val => ViewElement.create(true))),
            Immutable.Map<string, ViewElement>(profile.projects().map(val => ViewElement.create(true))),
            Immutable.Map<string, ViewElement>(profile.skills().map(val => ViewElement.create(true)))
        )
    }

    public static createNew(name: string, description: string, profile: Profile) {
        return ViewProfile.createNewEmpty(profile).name(name).description(description);
    }


}