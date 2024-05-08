import {emptyViewProfileStore, ViewProfileStore} from '../../model/view/ViewProfileStore';
import {ActionType} from '../ActionType';
import {ViewProfileActions} from './ViewProfileActions';
import {AbstractAction} from '../BaseActions';
import * as Immutable from 'immutable';
import {ViewCategory} from '../../model/view/ViewCategory';

export namespace ViewProfileReducer {
    import SetViewProfileAction = ViewProfileActions.SetViewProfileAction;
    import RemoveViewProfileAction = ViewProfileActions.RemoveViewProfileAction;
    import SetSortInProgressAction = ViewProfileActions.SetSortInProgressAction;
    import SetParentCategoryAction = ViewProfileActions.SetParentCategoryAction;

    export function reduce(store = emptyViewProfileStore(), action: AbstractAction): ViewProfileStore {
        switch (action.type) {
            case ActionType.SetViewProfile: {
                let act: SetViewProfileAction = action as SetViewProfileAction;
                let viewProfiles = store.viewProfiles;
                viewProfiles = viewProfiles.set(act.viewProfile.id, act.viewProfile);
                return {
                    ...store,
                    viewProfiles
                }
            }
            case ActionType.RemoveViewProfile: {
                let act: RemoveViewProfileAction = action as RemoveViewProfileAction;
                let viewProfiles = store.viewProfiles.remove(act.id);
                return {
                    ...store,
                    viewProfiles
                }
            }
            case ActionType.SetSortInProgress: {
                let act: SetSortInProgressAction = action as SetSortInProgressAction;
                return {
                    ...store,
                    sortInProgress: act.inProgress
                }
            }
            case ActionType.ResetViewState: {
                return emptyViewProfileStore();
            }
            case ActionType.ClearViewProfiles: {
                return {
                    ...store,
                    viewProfiles: store.viewProfiles.clear()
                }
            }
            case ActionType.SetParentCategories : {
                let act: SetParentCategoryAction = action as SetParentCategoryAction;
                let map = store.parentsForSkill;
                Object.keys(act.categoryMap).forEach(value => {
                    map = map.set(Number(value), act.categoryMap[value]);
                });
                return {
                    ...store,
                    parentsForSkill: map
                }
            }
            case ActionType.ClearParentCategories: {
                return {
                    ...store,
                    parentsForSkill: Immutable.Map<number, ViewCategory>(),
                }
            }
        }
        return store;
    }
}
