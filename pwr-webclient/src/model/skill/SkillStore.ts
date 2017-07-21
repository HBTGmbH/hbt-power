import {doop} from 'doop';
import {SkillCategory} from './SkillCategory';
import * as Immutable from 'immutable';
import {AddSkillStep} from './AddSkillStep';
import {UnCategorizedSkillChoice} from './UncategorizedSkillChoice';

@doop
export class SkillStore {
    /**
     * Skill tree root for the global, large skill tree.
     * @returns {Doop<SkillCategory, this>}
     */
    @doop public get skillTreeRoot() {return doop<SkillCategory, this>()};

    /**
     * Categories and their hierachy by skill name. Used to provide skill information.
     * @returns {Doop<Immutable.Map<string, string>, this>}
     */
    @doop public get categorieHierarchiesBySkillName() {return doop<Immutable.Map<string, string>, this>()};

    /**
     * Skill trees (personalized) per consultant. Maps initials to a skill category root.
     * This skill tree needs to be u
     * @returns {Doop<Immutable.Map<string, SkillCategory>, this>}

    @doop public get personalizedSkillTrees() {return doop<Immutable.Map<string, SkillCategory>, this>()};*/

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

    @doop public get addSkillError() {return doop<string, this>()};


    private constructor(skillTreeRoot: SkillCategory, categorieHierarchiesBySkillName: Immutable.Map<string, string>,
                        currentAddSkillStep: AddSkillStep, currentSkillRating: number, currentSkillName: string,
                        currentChoice: UnCategorizedSkillChoice, skillComment: string, addSkillError: string) {
        return this.skillTreeRoot(skillTreeRoot).categorieHierarchiesBySkillName(categorieHierarchiesBySkillName).currentAddSkillStep(currentAddSkillStep)
            .currentSkillName(currentSkillName).currentSkillRating(currentSkillRating).currentChoice(currentChoice).skillComment(skillComment)
            .addSkillError(addSkillError);
    }

    public static empty() {
        return new SkillStore(SkillCategory.of(-1, "root"), Immutable.Map<string, string>(), AddSkillStep.NONE, 1, "",
            UnCategorizedSkillChoice.PROCEED_WITH_COMMENT, "", null);
    }
}