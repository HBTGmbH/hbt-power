import {AbstractAction} from '../profile/database-actions';
import {SkillCategory} from '../../model/skill/SkillCategory';
import {APISkillServiceSkill, SkillServiceSkill} from '../../model/skill/SkillServiceSkill';
import {AddSkillStep} from '../../model/skill/AddSkillStep';
import {UnCategorizedSkillChoice} from '../../model/skill/UncategorizedSkillChoice';
export namespace SkillActions {
    export interface AddCategoryToTreeAction extends AbstractAction {
        parentId: number;
        toAdd: SkillCategory;
    }


    export interface AddSkillToTreeAction extends AbstractAction {
        categoryId: number;
        toAdd: SkillServiceSkill;
    }

    export interface ReadSkillHierarchyAction extends AbstractAction {
        skill: APISkillServiceSkill;
    }

    export interface SetAddSkillStepAction extends AbstractAction {
        step: AddSkillStep;
    }

    export interface SetCurrentChoiceAction extends AbstractAction {
        currentChoice: UnCategorizedSkillChoice;
    }

}