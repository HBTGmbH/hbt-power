import {SkillCategory} from '../../model/skill/SkillCategory';
import {APISkillServiceSkill, SkillServiceSkill} from '../../model/skill/SkillServiceSkill';
import {AddSkillStep} from '../../model/skill/AddSkillStep';
import {UnCategorizedSkillChoice} from '../../model/skill/UncategorizedSkillChoice';
import {TCategoryNode} from '../../model/skill/tree/TCategoryNode';
import {AbstractAction} from '../BaseActions';

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

export interface SetTreeChildrenOpenAction extends AbstractAction {
    categoryId: number;
}

export interface FilterTreeAction extends AbstractAction {
    searchTerm: string;
}

/**
 * Actions that invokes an update of id, qualifier and localizations for a given category
 * Children remain unchanged.
 */
export interface PartiallyUpdateSkillCategoryAction extends AbstractAction {
    skillCategory: SkillCategory;
}

export interface RemoveSkillCategoryAction extends AbstractAction {
    id: number;
}

export interface MoveCategoryAction extends AbstractAction {
    newParentId: number;
    toMoveId: number;
}

export interface MoveSkillAction extends AbstractAction {
    originCategoryId: number;
    targetCategoryId: number;
    skillId: number;
}

export interface RemoveSkillAction extends AbstractAction {
    skillId: number;
}

export interface UpdateSkillServiceSkillAction extends AbstractAction {
    skill: SkillServiceSkill;
}

export interface BatchAddSkillsAction extends AbstractAction {
    skills: Array<SkillServiceSkill>;
}

export interface InitializeTreeAction extends AbstractAction {
    root: TCategoryNode;
}
