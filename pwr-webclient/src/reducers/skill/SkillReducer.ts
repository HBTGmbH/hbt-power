import {SkillStore} from '../../model/skill/SkillStore';
import {AbstractAction} from '../profile/database-actions';
import {isNullOrUndefined} from 'util';
import {ActionType} from '../ActionType';
import {SkillActions} from './SkillActions';
export namespace SkillReducer {
    import AddCategoryToTreeAction = SkillActions.AddCategoryToTreeAction;
    import AddSkillToTreeAction = SkillActions.AddSkillToTreeAction;
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
            default:
                return skillStore;
        }

    }
}