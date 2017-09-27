import {SkillStore} from '../../model/skill/SkillStore';
import {AbstractAction, ChangeNumberValueAction, ChangeStringValueAction} from '../profile/database-actions';
import {isNullOrUndefined} from 'util';
import {ActionType} from '../ActionType';
import {SkillActions} from './SkillActions';
import {APISkillCategory} from '../../model/skill/SkillCategory';
import {AddSkillStep} from '../../model/skill/AddSkillStep';
import {UnCategorizedSkillChoice} from '../../model/skill/UncategorizedSkillChoice';
import {SkillServiceSkill} from '../../model/skill/SkillServiceSkill';
import {SkillTreeNode} from '../../model/skill/SkillTreeNode';

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
    import UpdateSkillServiceSkillAction = SkillActions.UpdateSkillServiceSkillAction;
    import BatchAddSkillsAction = SkillActions.BatchAddSkillsAction;
    import SetTreeChildrenOpenAction = SkillActions.SetTreeChildrenOpenAction;
    import FilterTreeAction = SkillActions.FilterTreeAction;

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
            .currentAddSkillStep(AddSkillStep.NONE).doneState("").addToProjectId("");
    }

    /**
     * Updates all resources in the {@link SkillStore} that reference the skill and returns the
     * new {@link SkillStore}
     * @param skillStore to update
     * @param skill updated skill
     * @returns {SkillStore} as a copy of the original SkillStore
     */
    function addOrUpdateSkill(skillStore: SkillStore, skill: SkillServiceSkill) {
        let skillsById = skillStore.skillsById().set(skill.id(), skill);
        let skillsByQualifier = skillStore.skillsByQualifier().set(skill.qualifier(), skill);

        return skillStore.skillsByQualifier(skillsByQualifier).skillsById(skillsById);
    }

    export function reduce(skillStore: SkillStore, action: AbstractAction): SkillStore {
        if(isNullOrUndefined(skillStore)) return SkillStore.empty();
        switch(action.type) {
            case ActionType.BatchAddSkills: {
                let act = action as BatchAddSkillsAction;
                let store = skillStore;
                act.skills.forEach(skill => {
                    store = addOrUpdateSkill(store, skill);
                });
                return store;
            }
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

                let categoryIdMap = skillStore.parentCategoryIdById();
                categoryIdMap.set(act.toAdd.id(), act.parentId);

                let root = skillStore.skillTreeRoot();
                root.addCategoryToTree(act.parentId, act.toAdd, map);
                root = Object.assign(SkillTreeNode.root(), root);
                return skillStore.skillTreeRoot(root).categoriesById(map).parentCategoryIdById(categoryIdMap);
            }
            case ActionType.RemoveSkillCategory: {
                let act = action as RemoveSkillCategoryAction;
                let categoriesById = skillStore.categoriesById().delete(act.id);

                let root = skillStore.skillTreeRoot();
                root.removeCategoryFromTree(act.id);
                root = Object.assign(SkillTreeNode.root(), root);
                return skillStore.skillTreeRoot(root).categoriesById(categoriesById);
            }
            case ActionType.AddSkillToTree: {
                let act = action as AddSkillToTreeAction;
                let root = skillStore.skillTreeRoot();
                root.addSkillToTree(act.categoryId, act.toAdd);
                root = Object.assign(SkillTreeNode.root(), root);
                return addOrUpdateSkill(skillStore, act.toAdd).skillTreeRoot(root);
            }
            case ActionType.MoveSkill: {
                let act = action as MoveSkillAction;
                let skill = skillStore.skillsById().get(act.skillId).categoryId(act.targetCategoryId);

                let root = skillStore.skillTreeRoot();
                root.removeSkillFromTree(act.originCategoryId, act.skillId);
                root.addSkillIdToTree(act.targetCategoryId, act.skillId);
                root = Object.assign(SkillTreeNode.root(), root);
                return addOrUpdateSkill(skillStore, skill).skillTreeRoot(root);
            }
            case ActionType.RemoveSkillServiceSkill: {
                let act = action as RemoveSkillServiceSkillAction;
                let skill = skillStore.skillsById().get(act.skillId)
                let root = skillStore.skillTreeRoot();
                root.removeSkillFromTree(skill.categoryId(), skill.id());
                root = Object.assign(SkillTreeNode.root(), root);
                return addOrUpdateSkill(skillStore, skill).skillTreeRoot(root);
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
            case ActionType.UpdateSkillServiceSkill: {
                let act = action as UpdateSkillServiceSkillAction;
                return addOrUpdateSkill(skillStore, act.skill);
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
            case ActionType.SetDoneMessage: {
                let act = action as ChangeStringValueAction;
                return skillStore.doneState(act.value);
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
            case ActionType.SetAddToProjectId: {
                let act = action as ChangeStringValueAction;
                return skillStore.addToProjectId(act.value);
            }
            case ActionType.ResetAddSkillDialog: {
                return resetAddSkillDialog(skillStore);
            }
            case ActionType.SetNoCategoryReason: {
                let act = action as ChangeStringValueAction;
                return skillStore.noCategoryReason(act.value);
            }
            case ActionType.SetTreeChildrenOpen: {
                let act = action as SetTreeChildrenOpenAction;
                let root = skillStore.skillTreeRoot();
                root.toggleOpen(act.categoryId);
                return skillStore.skillTreeRoot(SkillTreeNode.shallowCopy(root));
            }
            case ActionType.FilterTree: {
                let act = action as FilterTreeAction;
                let root = skillStore.skillTreeRoot();
                root.clearFilter();
                if(!isNullOrUndefined(act.searchTerm) && act.searchTerm.length > 0) {
                    root.filter(act.searchTerm, skillStore.skillsById(), skillStore.categoriesById());
                    console.log("Filtered root", root);
                }
                return skillStore.skillTreeRoot(SkillTreeNode.shallowCopy(root));
            }
            default:
                return skillStore;
        }

    }
}