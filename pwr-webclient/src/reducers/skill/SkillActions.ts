import {AbstractAction} from '../profile/database-actions';
import {SkillCategory} from '../../model/skill/SkillCategory';
import {APISkillServiceSkill, SkillServiceSkill} from '../../model/skill/SkillServiceSkill';
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
}