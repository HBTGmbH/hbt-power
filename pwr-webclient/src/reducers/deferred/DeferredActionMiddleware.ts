import {MiddlewareAPI} from 'redux';
import {ApplicationState} from '../reducerIndex';
import {ActionType} from '../ActionType';
import {deferAction} from './DeferredActions';
import {selectedProjectHasChanged, selectIndexHasChanged} from '../../utils/PwrStoreUtils';

interface DeferrableAction<AppState> {
    type: ActionType;
    condition?: (state: AppState, action: any) => boolean;
}


const deferredActions: DeferrableAction<ApplicationState>[] = [
    {
        type: ActionType.SelectProject,
        condition: (state, action) => selectedProjectHasChanged(state.profileStore)  && selectIndexHasChanged(state.profileStore, action.value)
    },
    {
        type: ActionType.CancelEditSelectedProject,
        condition: (state) => selectedProjectHasChanged(state.profileStore)
    }
];

export const deferredActionMiddleware = (api: MiddlewareAPI<ApplicationState>) => (next) => (action): any => {
    if (action.type === ActionType.ConfirmDeferredAction) {
        // Continue action and clear deferred state
        next(api.getState().deferred.deferredAction);
        next(action);
    } else {
        let deferred = deferredActions.find(value => value.type === action.type);
        if (deferred && deferred.condition(api.getState(), action)) {
            next(deferAction(action));
        } else {
            return next(action);
        }
    }
};
