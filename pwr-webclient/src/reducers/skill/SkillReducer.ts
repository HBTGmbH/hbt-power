import {emptySkillStore, SkillStore} from '../../model/skill/SkillStore';
import {ActionType} from '../ActionType';
import {APISkillCategory} from '../../model/skill/SkillCategory';
import {AddSkillStep} from '../../model/skill/AddSkillStep';
import {UnCategorizedSkillChoice} from '../../model/skill/UncategorizedSkillChoice';
import {SkillServiceSkill} from '../../model/skill/SkillServiceSkill';
import {SkillTreeNode} from '../../model/skill/SkillTreeNode';
import {SkillTreeBuilder} from './SkillTreeBuilder';
import {AbstractAction, ChangeBoolValueAction, ChangeNumberValueAction, ChangeStringValueAction} from '../BaseActions';
import {
    AddCategoryToTreeAction,
    AddSkillToTreeAction, FilterTreeAction, InitializeTreeAction,
    MoveCategoryAction,
    MoveSkillAction,
    PartiallyUpdateSkillCategoryAction, ReadSkillHierarchyAction, RemoveSkillAction,
    RemoveSkillCategoryAction, SetAddSkillStepAction, SetCurrentChoiceAction, SetTreeChildrenOpenAction, UpdateSkillServiceSkillAction
} from './SkillActions';

export function buildHierarchy(category: APISkillCategory): string {
    if (!!(category)) {
        if (!!(category.category)) {
            return category.qualifier + ' => ' + buildHierarchy(category.category);
        } else {
            return category.qualifier;
        }
    }
    return '';
}

export class SkillReducer {




    private static resetAddSkillDialog(skillStore: SkillStore): SkillStore {
        return {
            ...skillStore,
            currentChoice: UnCategorizedSkillChoice.PROCEED_WITH_COMMENT,
            addSkillError: null,
            skillComment: '',
            currentSkillName: '',
            currentSkillRating: 1,
            currentAddSkillStep: AddSkillStep.NONE,
            doneState: '',
            addToProjectId: '',
        }
    }

    /**
     * Updates all resources in the {@link SkillStore} that reference the skill and returns the
     * new {@link SkillStore}
     * @param skillStore to update
     * @param skill updated skill
     * @returns {SkillStore} as a copy of the original SkillStore
     */
    private static addOrUpdateSkill(skillStore: SkillStore, skill: SkillServiceSkill): SkillStore {
        let skillsById = skillStore.skillsById.set(skill.id(), skill);
        let skillsByQualifier = skillStore.skillsByQualifier.set(skill.qualifier(), skill);

        return {
            ...skillStore,
            skillsByQualifier,
            skillsById
        }
    }

    public static reduce(skillStore: SkillStore, action: AbstractAction): SkillStore {
        if (!skillStore) {
            return emptySkillStore();
        }
        switch (action.type) {
            case ActionType.UpdateSkillCategory: {
                let act = action as PartiallyUpdateSkillCategoryAction;
                // First, update the map
                let categoriesById = skillStore.categoriesById;
                categoriesById = categoriesById.set(act.skillCategory.id, act.skillCategory);
                return {
                    ...skillStore,
                    categoriesById
                }
            }
            case ActionType.AddCategoryToTree: {
                let act = action as AddCategoryToTreeAction;
                if (!(act.parentId)) {
                    act.parentId = -1;
                }
                let categoriesById = skillStore.categoriesById;
                categoriesById = categoriesById.set(act.toAdd.id, act.toAdd);

                let parentCategoryIdById = skillStore.parentCategoryIdById;
                parentCategoryIdById.set(act.toAdd.id, act.parentId);

                let skillTreeRoot = skillStore.skillTreeRoot;
                skillTreeRoot.addCategoryToTree(act.parentId, act.toAdd, categoriesById);
                skillTreeRoot = SkillTreeNode.shallowCopy(skillTreeRoot);
                return {
                    ...skillStore,
                    skillTreeRoot,
                    categoriesById,
                    parentCategoryIdById
                }
            }
            case ActionType.RemoveSkillCategory: {
                let act = action as RemoveSkillCategoryAction;
                let categoriesById = skillStore.categoriesById.delete(act.id);

                let skillTreeRoot = skillStore.skillTreeRoot;
                skillTreeRoot.removeCategoryFromTree(act.id);
                skillTreeRoot = SkillTreeNode.shallowCopy(skillTreeRoot);
                return {
                    ...skillStore,
                    skillTreeRoot,
                    categoriesById,
                }
            }
            case ActionType.AddSkillToTree: {
                let act = action as AddSkillToTreeAction;
                let root = skillStore.skillTreeRoot;
                root.addSkillToTree(act.categoryId, act.toAdd);
                root = SkillTreeNode.shallowCopy(root);
                return {
                    ...skillStore,
                    ...SkillReducer.addOrUpdateSkill(skillStore, act.toAdd),
                    skillTreeRoot: root
                }
            }
            case ActionType.MoveCategory: {
                let act = action as MoveCategoryAction;

                let root = skillStore.skillTreeRoot;

                let removedNode = root.removeCategoryFromTree(act.toMoveId);
                root.addNodeToTree(removedNode, act.newParentId);
                root.sort(skillStore.categoriesById, skillStore.skillsById);
                root.setVisibility(removedNode.skillCategoryId, true);
                let newMap = skillStore.parentCategoryIdById.set(removedNode.skillCategoryId, act.newParentId);
                return {
                    ...skillStore,
                    skillTreeRoot: SkillTreeNode.shallowCopy(root),
                    parentCategoryIdById: newMap,
                }
            }
            case ActionType.MoveSkill: {
                let act = action as MoveSkillAction;
                let skill = skillStore.skillsById.get(act.skillId).setCategoryId(act.targetCategoryId);

                let root = skillStore.skillTreeRoot;
                root.removeSkillFromTree(act.originCategoryId, act.skillId);
                root.addSkillIdToTree(act.targetCategoryId, act.skillId);
                root = SkillTreeNode.shallowCopy(root);
                return {
                    ...SkillReducer.addOrUpdateSkill(skillStore, skill),
                    skillTreeRoot: root,
                }
            }
            case ActionType.RemoveSkillServiceSkill: {
                let act = action as RemoveSkillAction;
                let skill = skillStore.skillsById.get(act.skillId);
                let root = skillStore.skillTreeRoot;
                root.removeSkillFromTree(skill.categoryId(), skill.id());
                root = SkillTreeNode.shallowCopy(root);
                return {
                    ...SkillReducer.addOrUpdateSkill(skillStore, skill),
                    skillTreeRoot: root
                }
            }
            case ActionType.ReadSkillHierarchy: {
                let act = action as ReadSkillHierarchyAction;
                if (!!(act.skill.category)) {
                    let map = skillStore.categorieHierarchiesBySkillName;
                    map = map.set(act.skill.qualifier, act.skill.qualifier + ' => ' + buildHierarchy(act.skill.category));
                    return {
                        ...skillStore,
                        categorieHierarchiesBySkillName: map
                    }
                }
                return skillStore;
            }
            case ActionType.UpdateSkillServiceSkill: {
                let act = action as UpdateSkillServiceSkillAction;
                return SkillReducer.addOrUpdateSkill(skillStore, act.skill);
            }
            case ActionType.SetCurrentSkillName: {
                const {value} = action as ChangeStringValueAction;
                return {
                    ...skillStore,
                    currentSkillName: value
                }
            }
            case ActionType.SetCurrentSkillRating: {
                const {value} = action as ChangeNumberValueAction;
                return {
                    ...skillStore,
                    currentSkillRating: value,
                }
            }
            case ActionType.SetAddSkillStep: {
                const {step} = action as SetAddSkillStepAction;
                return {
                    ...skillStore,
                    currentAddSkillStep: step
                }
            }
            case ActionType.SetDoneMessage: {
                const {value} = action as ChangeStringValueAction;
                return {
                    ...skillStore,
                    doneState: value,
                }
            }
            case ActionType.StepBackToSkillInfo: {
                return {
                    ...SkillReducer.resetAddSkillDialog(skillStore),
                    currentAddSkillStep: AddSkillStep.SKILL_INFO
                }
            }
            case ActionType.ChangeSkillComment: {
                let {value} = action as ChangeStringValueAction;
                return {
                    ...skillStore,
                    skillComment: value,
                    addSkillError: null
                }
            }
            case ActionType.SetCurrentChoice: {
                const {currentChoice} = action as SetCurrentChoiceAction;
                return {
                    ...skillStore,
                    currentChoice
                }
            }
            case ActionType.SetAddSkillError: {
                const {value} = action as ChangeStringValueAction;
                return {
                    ...skillStore,
                    addSkillError: value
                }
            }
            case ActionType.SetAddToProjectId: {
                const {value} = action as ChangeStringValueAction;
                return {
                    ...skillStore,
                    addToProjectId: value,
                }
            }
            case ActionType.ResetAddSkillDialog: {
                return SkillReducer.resetAddSkillDialog(skillStore);
            }
            case ActionType.SetNoCategoryReason: {
                let {value} = action as ChangeStringValueAction;
                return {
                    ...skillStore,
                    noCategoryReason: value
                }
            }
            case ActionType.SetTreeChildrenOpen: {
                let act = action as SetTreeChildrenOpenAction;
                let root = skillStore.skillTreeRoot;
                root.toggleOpenDown(act.categoryId);
                return {
                    ...skillStore,
                    skillTreeRoot: SkillTreeNode.shallowCopy(root)
                }
            }
            case ActionType.FilterTree: {
                const {searchTerm} = action as FilterTreeAction;
                const root = skillStore.skillTreeRoot;
                root.clearFilter();
                if (skillStore.filterNonCustomSkills || (searchTerm && searchTerm.length >= 0)) {
                    root.filter(skillStore.filterNonCustomSkills, searchTerm, skillStore.skillsById, skillStore.categoriesById);
                }
                return {
                    ...skillStore,
                    skillTreeRoot: SkillTreeNode.shallowCopy(root),
                    filterTerm: searchTerm
                }
            }
            case ActionType.SetCustomSkillFiltering: {
                let act = action as ChangeBoolValueAction;
                let root = skillStore.skillTreeRoot;
                root.clearFilter();
                if (act.value || (skillStore.filterTerm && skillStore.filterTerm.length >= 0)) {
                    root.filter(act.value, skillStore.filterTerm, skillStore.skillsById, skillStore.categoriesById);
                }
                return {
                    ...skillStore,
                    filterNonCustomSkills: act.value,
                    skillTreeRoot: SkillTreeNode.shallowCopy(root),
                }
            }
            case ActionType.LoadTree: {
                let act = action as InitializeTreeAction;
                let result = SkillTreeBuilder.for(act.root).build();
                return {
                    ...skillStore,
                    skillsById: result.skillsById,
                    categoriesById: result.categoriesById,
                    skillTreeRoot: result.tree
                }
            }
            default:
                return skillStore;
        }

    }
}
