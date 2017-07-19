import {SkillStore} from '../../model/skill/SkillStore';
import {AbstractAction} from '../profile/database-actions';
import {isNullOrUndefined} from 'util';
import {ActionType} from '../ActionType';
import {SkillActions} from './SkillActions';
import {APISkillCategory} from '../../model/skill/SkillCategory';
export namespace SkillReducer {
    import AddCategoryToTreeAction = SkillActions.AddCategoryToTreeAction;
    import AddSkillToTreeAction = SkillActions.AddSkillToTreeAction;
    import ReadSkillHierarchyAction = SkillActions.ReadSkillHierarchyAction;

    export function buildHierarchy(category: APISkillCategory): string {
        if(!isNullOrUndefined(category.category)) {
            if(!isNullOrUndefined(category.category.category)) {
                return category.qualifier +  " => " + buildHierarchy(category.category);
            }
            else {
                return category.qualifier;
            }
        }
        return "";
    }

    export function reduce(skillStore: SkillStore, action: AbstractAction): SkillStore {
        if(isNullOrUndefined(skillStore)) return SkillStore.empty();
        switch(action.type) {
            case ActionType.AddCategoryToTree: {
                let act = action as AddCategoryToTreeAction;
                return skillStore.skillTreeRoot(skillStore.skillTreeRoot().addCategoryToTree(act.parentId, act.toAdd))
            }
            case ActionType.AddSkillToTree: {
                let act = action as AddSkillToTreeAction;
                return skillStore.skillTreeRoot(skillStore.skillTreeRoot().addSkillToTree(act.categoryId, act.toAdd));
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
            default:
                return skillStore;
        }

    }
}