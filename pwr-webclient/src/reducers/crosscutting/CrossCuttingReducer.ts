import {CrossCuttingStore, empty} from '../../model/crosscutting/CrossCuttingStore';
import {ActionType} from '../ActionType';
import {SetLoginErrorAction, SetLoginStatusAction, SetRequestPendingAction} from './CrossCuttingActionCreator';
import {AbstractAction} from '../profile/database-actions';


export namespace CrossCuttingReducer {

    export function reduce(store = empty, action: AbstractAction): CrossCuttingStore {
        if (action.type === ActionType.SetLoginError) {
            return {...store, ...{loginError: (action as SetLoginErrorAction).error}};
        }
        if (action.type === ActionType.SetLoginStatus) {
            return {...store, ...{loginStatus: (action as SetLoginStatusAction).loginStatus}};
        }
        if (action.type === ActionType.SetRequestPending) {
            return {...store, ...{requestPending: (action as SetRequestPendingAction).requestPending}};
        }
        return store;
    }
}
