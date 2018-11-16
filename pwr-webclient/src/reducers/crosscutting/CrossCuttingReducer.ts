import {CrossCuttingStore} from '../../model/crosscutting/CrossCuttingStore';
import {AbstractAction} from '../profile/database-actions';
import {ActionType} from '../ActionType';
import {SetRequestPendingAction} from './CrossCuttingActionCreator';

export namespace CrossCuttingReducer {

    export function reduce(store: CrossCuttingStore, action: AbstractAction): CrossCuttingStore {
        if (!store) {
            return CrossCuttingStore.empty();
        }
        if (action.type === ActionType.SetRequestPending) {
            let act: SetRequestPendingAction = action as SetRequestPendingAction;
            return store.requestPending(act.requestPending);
        }
        return store;
    }
}