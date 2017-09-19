import {doop} from 'doop';
import {SkillCategory} from './SkillCategory';
import * as Immutable from 'immutable';
import {AddSkillStep} from './AddSkillStep';
import {UnCategorizedSkillChoice} from './UncategorizedSkillChoice';
import {SkillServiceSkill} from './SkillServiceSkill';
import {SkillTreeNode} from './SkillTreeNode';

/**
 * Replication of the skill service data; Stores skill service data in various forms.
 */
@doop
export class SkillStore {

    /**
     * Skill tree root for the global, large skill tree.
     * @returns {Doop<SkillCategory, this>}
     */
    @doop public get skillTreeRoot() {return doop<SkillTreeNode, this>()};

    /**
     * Flat map of all categories
     * @returns {Map<any, any>|any|Map<number, SkillCategory>}
     */
    @doop public get categoriesById() {return doop<Immutable.Map<number, SkillCategory>, this>()};


    /**
     * All categories that have been added to the skill tree are also stored here, referenced by ID.
     * Implemented for fast access to a possible data set of 60k skills that may be replicated into the client
     * @returns {Doop<Immutable.Map<number, SkillServiceSkill>, this>}
     */
    @doop public get skillsById() {return doop<Immutable.Map<number, SkillServiceSkill>, this>()};

    /**
     * All skills that have been replicated from the skill service into this client
     * @returns {Doop<Immutable.Map<string, SkillServiceSkill>, this>}
     */
    @doop public get skillsByQualifier() {return doop<Immutable.Map<string, SkillServiceSkill>, this>()};

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

    @doop public get doneState() {return doop<string, this>()};

    /**
     * Defines if the skill in the add skill dialog is supposed to be assgiedn to a project.
     * If this value is empty (=""), it means that the skill isnt added to any project.
     */
    @doop public get addToProjectId() {return doop<string, this>()};




    private constructor(skillTreeRoot: SkillTreeNode,
                        categorieHierarchiesBySkillName: Immutable.Map<string, string>,
                        skillsById: Immutable.Map<number, SkillServiceSkill>,
                        currentAddSkillStep: AddSkillStep, currentSkillRating: number, currentSkillName: string,
                        currentChoice: UnCategorizedSkillChoice, skillComment: string, addSkillError: string,
                        noCategoryReason: string, categoriesById: Immutable.Map<number, SkillCategory>,
                        skillsByQualifier: Immutable.Map<string, SkillServiceSkill>,
                        profileOnlySkillQualifiers: Immutable.Set<string>,
                        doneState: string, addToProjectId: string
    ) {
        return this.skillTreeRoot(skillTreeRoot).categorieHierarchiesBySkillName(categorieHierarchiesBySkillName).currentAddSkillStep(currentAddSkillStep)
            .currentSkillName(currentSkillName).currentSkillRating(currentSkillRating).currentChoice(currentChoice).skillComment(skillComment)
            .addSkillError(addSkillError).noCategoryReason(noCategoryReason).categoriesById(categoriesById).skillsById(skillsById)
            .skillsByQualifier(skillsByQualifier).doneState(doneState).addToProjectId(addToProjectId);
    }

    public static empty() {
        return new SkillStore(SkillTreeNode.root(), Immutable.Map<string, string>(),
            Immutable.Map<number, SkillServiceSkill>(),
            AddSkillStep.NONE, 1, "",
            UnCategorizedSkillChoice.PROCEED_WITH_COMMENT, "", null, "",Immutable.Map<number, SkillCategory>(),
            Immutable.Map<string, SkillServiceSkill>(),
            Immutable.Set<string>(), "", "");
    }

    public skillWithQualifierExists(qualifier: string) {
        return this.skillsByQualifier().has(qualifier);
    }
}