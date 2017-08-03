import {doop} from 'doop';
import {SkillCategory} from './SkillCategory';
import * as Immutable from 'immutable';
import {AddSkillStep} from './AddSkillStep';
import {UnCategorizedSkillChoice} from './UncategorizedSkillChoice';
import {SkillServiceSkill} from './SkillServiceSkill';

@doop
export class SkillStore {
    /**
     * Skill tree root for the global, large skill tree.
     * @returns {Doop<SkillCategory, this>}
     */
    @doop public get skillTreeRoot() {return doop<SkillCategory, this>()};

    /**
     * Flat map of all categories
     * @returns {Map<any, any>|any|Map<number, SkillCategory>}
     */
    @doop public get categoriesById() {return doop<Immutable.Map<number, SkillCategory>, this>()};


    /**
     * All categories that have been added to the skill tree are also stored here, referenced by ID
     * @returns {Doop<Immutable.Map<number, SkillServiceSkill>, this>}
     */
    @doop public get skillsById() {return doop<Immutable.Map<number, SkillServiceSkill>, this>()};

    /**
     * Categories and their hierachy by skill name. Used to provide skill information.
     * @returns {Doop<Immutable.Map<string, string>, this>}
     */
    @doop public get categorieHierarchiesBySkillName() {return doop<Immutable.Map<string, string>, this>()};


    // == The following refer to the create skill dialog == //

    @doop public get currentAddSkillStep() {return doop<AddSkillStep, this>()};

    /**
     * Rating of the skill that is currently created
     * @returns {Doop<number, this>}
     */
    @doop public get currentSkillRating() {return doop<number, this>()};

    /**
     * Name of the skill that is currently created.
     * @returns {Doop<string, this>}
     */
    @doop public get currentSkillName() {return doop<string, this>()}

    @doop public get currentChoice() {return doop<UnCategorizedSkillChoice, this>()};

    @doop public get skillComment() {return doop<string, this>()};

    /**
     * Error text displayed in the add skill dialog, related to the comment field.
     * @returns {Doop<string, this>}
     */
    @doop public get addSkillError() {return doop<string, this>()};

    /**
     * Reason why no category for a given skill was found.
     * @returns {Doop<string, this>}
     */
    @doop public get noCategoryReason() {return doop<string, this>()};


    private constructor(skillTreeRoot: SkillCategory,
                        categorieHierarchiesBySkillName: Immutable.Map<string, string>,
                        skillsById: Immutable.Map<number, SkillServiceSkill>,
                        currentAddSkillStep: AddSkillStep, currentSkillRating: number, currentSkillName: string,
                        currentChoice: UnCategorizedSkillChoice, skillComment: string, addSkillError: string,
                        noCategoryReason: string, categoriesById: Immutable.Map<number, SkillCategory>) {
        return this.skillTreeRoot(skillTreeRoot).categorieHierarchiesBySkillName(categorieHierarchiesBySkillName).currentAddSkillStep(currentAddSkillStep)
            .currentSkillName(currentSkillName).currentSkillRating(currentSkillRating).currentChoice(currentChoice).skillComment(skillComment)
            .addSkillError(addSkillError).noCategoryReason(noCategoryReason).categoriesById(categoriesById).skillsById(skillsById);
    }

    public static empty() {
        return new SkillStore(SkillCategory.of(-1, "root"), Immutable.Map<string, string>(),
            Immutable.Map<number, SkillServiceSkill>(),
            AddSkillStep.NONE, 1, "",
            UnCategorizedSkillChoice.PROCEED_WITH_COMMENT, "", null, "",Immutable.Map<number, SkillCategory>());
    }
}