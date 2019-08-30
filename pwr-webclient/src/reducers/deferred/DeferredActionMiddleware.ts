import {MiddlewareAPI} from 'redux';
import {ApplicationState} from '../reducerIndex';
import {ActionType} from '../ActionType';
import {deferDeleteEntry, deferUnsavedChanges} from './DeferredActions';
import {selectedProjectHasChanged, selectIndexHasChanged} from '../../utils/PwrStoreUtils';
import {AbstractAction} from '../BaseActions';

interface DeferrableAction<AppState> {
    type: ActionType;
    condition?: (state: AppState, action: any) => boolean;
    makeAction: (action: AbstractAction) => AbstractAction,
}

const unconditional = () => true;

const deferredActions: DeferrableAction<ApplicationState>[] = [
    {
        type: ActionType.SelectProject,
        condition: (state, action) => selectedProjectHasChanged(state.profileStore)  && selectIndexHasChanged(state.profileStore, action.value),
        makeAction: action => deferUnsavedChanges(action)
    },
    {
        type: ActionType.CancelEditSelectedProject,
        condition: (state) => selectedProjectHasChanged(state.profileStore),
        makeAction: action => deferUnsavedChanges(action)
    },
    {
        type: ActionType.AsyncDeleteEntry,
        condition: unconditional,
        makeAction: action => deferDeleteEntry(action)
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
            next(deferred.makeAction(action));
        } else {
            return next(action);
        }
    }
};
