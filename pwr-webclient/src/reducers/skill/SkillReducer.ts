import {SkillStore} from '../../model/skill/SkillStore';
import {AbstractAction, ChangeNumberValueAction, ChangeStringValueAction} from '../profile/database-actions';
import {isNullOrUndefined} from 'util';
import {ActionType} from '../ActionType';
import {SkillActions} from './SkillActions';
import {APISkillCategory} from '../../model/skill/SkillCategory';
import {AddSkillStep} from '../../model/skill/AddSkillStep';
import {UnCategorizedSkillChoice} from '../../model/skill/UncategorizedSkillChoice';
export namespace SkillReducer {
    import AddCategoryToTreeAction = SkillActions.AddCategoryToTreeAction;
    import AddSkillToTreeAction = SkillActions.AddSkillToTreeAction;
    import ReadSkillHierarchyAction = SkillActions.ReadSkillHierarchyAction;
    import SetAddSkillStepAction = SkillActions.SetAddSkillStepAction;
    import SetCurrentChoiceAction = SkillActions.SetCurrentChoiceAction;
    import PartiallyUpdateSkillCategoryAction = SkillActions.PartiallyUpdateSkillCategoryAction;
    import RemoveSkillCategoryAction = SkillActions.RemoveSkillCategoryAction;
    import MoveSkillAction = SkillActions.MoveSkillAction;
    import RemoveSkillServiceSkillAction = SkillActions.RemoveSkillAction;

    export function buildHierarchy(category: APISkillCategory): string {
        if(!isNullOrUndefined(category)) {
            if(!isNullOrUndefined(category.category)) {
                return category.qualifier +  " => " + buildHierarchy(category.category);
            }
            else {
                return category.qualifier;
            }
        }
        return "";
    }


    function resetAddSkillDialog(skillStore: SkillStore): SkillStore {
        return skillStore.currentChoice(UnCategorizedSkillChoice.PROCEED_WITH_COMMENT)
            .addSkillError(null).skillComment("").currentSkillName("").currentSkillRating(1)
            .currentAddSkillStep(AddSkillStep.NONE)
    }

    export function reduce(skillStore: SkillStore, action: AbstractAction): SkillStore {
        if(isNullOrUndefined(skillStore)) return SkillStore.empty();
        switch(action.type) {
            case ActionType.UpdateSkillCategory: {
                let act = action as PartiallyUpdateSkillCategoryAction;
                // First, update the map
                let categoriesById = skillStore.categoriesById();
                categoriesById = categoriesById.set(act.skillCategory.id(), act.skillCategory);
                return skillStore.categoriesById(categoriesById);
            }
            case ActionType.AddCategoryToTree: {
                let act = action as AddCategoryToTreeAction;
                if(isNullOrUndefined(act.parentId)) {
                    act.parentId = -1;
                }
                let map = skillStore.categoriesById();
                map = map.set(act.toAdd.id(), act.toAdd);
                return skillStore.skillTreeRoot(skillStore.skillTreeRoot().addCategoryToTree(act.parentId, act.toAdd, map)).categoriesById(map);
            }
            case ActionType.AddSkillToTree: {
                let act = action as AddSkillToTreeAction;
                let map = skillStore.skillsById();
                map = map.set(act.toAdd.id(), act.toAdd);
                return skillStore
                    .skillTreeRoot(skillStore.skillTreeRoot().addSkillToTree(act.categoryId, act.toAdd))
                    .skillsById(map);
            }
            case ActionType.RemoveSkillCategory: {
                let act = action as RemoveSkillCategoryAction;
                let categoriesById = skillStore.categoriesById().delete(act.id);
                let root = skillStore.skillTreeRoot().removeCategoryFromChildren(act.id);
                return skillStore.skillTreeRoot(root).categoriesById(categoriesById);
            }
            case ActionType.MoveSkill: {
                let act = action as MoveSkillAction;
                let root = skillStore.skillTreeRoot().removeSkillFromTree(act.originCategoryId, act.skillId);
                let skillsById = skillStore.skillsById();
                let skill = skillsById.get(act.skillId).categoryId(act.targetCategoryId);
                skillsById = skillsById.set(skill.id(), skill);
                root = root.addSkillIdToTree(act.targetCategoryId, act.skillId);
                return skillStore.skillTreeRoot(root).skillsById(skillsById);
            }
            case ActionType.RemoveSkillServiceSkill: {
                let act = action as RemoveSkillServiceSkillAction;
                let skill = skillStore.skillsById().get(act.skillId)
                let skillsById = skillStore.skillsById().remove(act.skillId);
                let root = skillStore.skillTreeRoot().removeSkillFromTree(skill.categoryId(), skill.id());
                return skillStore.skillTreeRoot(root).skillsById(skillsById);
            }
            case ActionType.ReadSkillHierarchy: {
                let act = action as ReadSkillHierarchyAction;
                if(!isNullOrUndefined(act.skill.category)) {
                    let map = skillStore.categorieHierarchiesBySkillName();
                    map = map.set(act.skill.qualifier, act.skill.qualifier + " => " + buildHierarchy(act.skill.category));
                    return skillStore.categorieHierarchiesBySkillName(map);
                }
                return skillStore;
            }
            case ActionType.SetCurrentSkillName: {
                let act = action as ChangeStringValueAction;
                return skillStore.currentSkillName(act.value);
            }
            case ActionType.SetCurrentSkillRating: {
                let act = action as ChangeNumberValueAction;
                return skillStore.currentSkillRating(act.value);
            }
            case ActionType.SetAddSkillStep: {
                let act = action as SetAddSkillStepAction;
                return skillStore.currentAddSkillStep(act.step);
            }
            case ActionType.StepBackToSkillInfo: {
                return resetAddSkillDialog(skillStore).currentAddSkillStep(AddSkillStep.SKILL_INFO);
            }
            case ActionType.ChangeSkillComment: {
                let act = action as ChangeStringValueAction;
                return skillStore.skillComment(act.value).addSkillError(null);
            }
            case ActionType.SetCurrentChoice: {
                let act = action as SetCurrentChoiceAction;
                return skillStore.currentChoice(act.currentChoice);
            }
            case ActionType.SetAddSkillError: {
                let act = action as ChangeStringValueAction;
                return skillStore.addSkillError(act.value);
            }
            case ActionType.ResetAddSkillDialog: {
                return resetAddSkillDialog(skillStore);
            }
            case ActionType.SetNoCategoryReason: {
                let act = action as ChangeStringValueAction;
                return skillStore.noCategoryReason(act.value);
            }
            default:
                return skillStore;
        }

    }
}