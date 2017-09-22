import {ViewProfileStore} from '../../model/view/ViewProfileStore';
import {AbstractAction} from '../profile/database-actions';
import {isNullOrUndefined} from 'util';
import {ActionType} from '../ActionType';
import {ViewProfileActions} from './ViewProfileActions';

export namespace ViewProfileReducer {
    import SetViewProfileAction = ViewProfileActions.SetViewProfileAction;
    import RemoveViewProfileAction = ViewProfileActions.RemoveViewProfileAction;
    import SetSortInProgressAction = ViewProfileActions.SetSortInProgressAction;
    export function reduce(store: ViewProfileStore, action: AbstractAction) {
        console.debug("ViewProfileReducer called with action type " + ActionType[action.type]);
        if(isNullOrUndefined(store)) {
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
        }
        return store;
    }
}