import {ViewProfileStore} from '../../model/view/ViewProfileStore';
import {isNullOrUndefined} from 'util';
import {ActionType} from '../ActionType';
import {ViewProfileActions} from './ViewProfileActions';
import {AbstractAction} from '../BaseActions';
import {ViewCategory} from '../../model/view/ViewCategory';

export namespace ViewProfileReducer {
    import SetViewProfileAction = ViewProfileActions.SetViewProfileAction;
    import RemoveViewProfileAction = ViewProfileActions.RemoveViewProfileAction;
    import SetSortInProgressAction = ViewProfileActions.SetSortInProgressAction;
    import SetParentCategoryAction = ViewProfileActions.SetParentCategoryAction;

    export function reduce(store: ViewProfileStore, action: AbstractAction): ViewProfileStore {
        if (isNullOrUndefined(store)) {
            return ViewProfileStore.empty();
        }
        switch (action.type) {
            case ActionType.SetViewProfile: {
                let act: SetViewProfileAction = action as SetViewProfileAction;
                let viewProfiles = store.viewProfiles();
                viewProfiles = viewProfiles.set(act.viewProfile.id, act.viewProfile);
                return store.viewProfiles(viewProfiles);
            }
            case ActionType.RemoveViewProfile: {
                let act: RemoveViewProfileAction = action as RemoveViewProfileAction;
                let viewProfiles = store.viewProfiles().remove(act.id);
                return store.viewProfiles(viewProfiles);
            }
            case ActionType.SetSortInProgress: {
                let act: SetSortInProgressAction = action as SetSortInProgressAction;
                return store.sortInProgress(act.inProgress);
            }
            case ActionType.ResetViewState: {
                return ViewProfileStore.empty();
            }
            case ActionType.ClearViewProfiles: {
                return store.viewProfiles(store.viewProfiles().clear());
            }
            case ActionType.SetParentCategories : {
                let act: SetParentCategoryAction = action as SetParentCategoryAction;
                console.log('Reducing categoryMap', act.categoryMap);
                let map = store.parentsForSkill();
                Object.keys(act.categoryMap).forEach(value => {
                    map = map.set(Number(value), act.categoryMap[value]);
                });
                return store.parentsForSkill(map);
            }
            case ActionType.ClearParentCategories: {
                return store.parentsForSkill(null);
            }
        }
        return store;
    }
}
