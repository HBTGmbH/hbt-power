import {CrossCuttingStore, empty} from '../../model/crosscutting/CrossCuttingStore';
import {ActionType} from '../ActionType';
import {
    ChangePendingRequestsAction,
    SetLoginErrorAction,
    SetLoginStatusAction
} from './CrossCuttingActionCreator';
import {AbstractAction} from '../BaseActions';


export class CrossCuttingReducer {

    public static reduce(store = empty, action: AbstractAction): CrossCuttingStore {
        if (action.type === ActionType.SetLoginError) {
            return {...store, ...{loginError: (action as SetLoginErrorAction).error}};
        }
        if (action.type === ActionType.SetLoginStatus) {
            return {...store, ...{loginStatus: (action as SetLoginStatusAction).loginStatus}};
        }
        if (action.type === ActionType.OpenSessionExpiredDialog) {
            return {...store, sessionExpiredDialogOpen: true};
        }
        if (action.type === ActionType.CloseSessionExpiredDialog) {
            return {...store, sessionExpiredDialogOpen: false};
        }
        if (action.type === ActionType.ChangePendingRequests) {
            const count = store.pendingRequests + (action as ChangePendingRequestsAction).delta;
            return {...store, pendingRequests: Math.max(0, count)};
        }
        return store;
    }
}
