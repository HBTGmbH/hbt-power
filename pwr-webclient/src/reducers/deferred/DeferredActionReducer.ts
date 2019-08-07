import {DeferredStore, emptyDeferredStore} from './DeferredStore';
import {ConfirmDeferredActionAction, DeferActionAction, RejectDeferredActionAction} from './DeferredActions';
import {ActionType} from '../ActionType';

type DeferredActionType = ConfirmDeferredActionAction | RejectDeferredActionAction | DeferActionAction;

export function reduceDeferredAction(store = emptyDeferredStore, action: DeferredActionType): DeferredStore {
    switch (action.type) {
        case ActionType.ConfirmDeferredAction:
        case ActionType.RejectDeferredAction:
            return {...store, ...{deferredAction: null}};
        case ActionType.DeferAction: {
            return {...store, ...{deferredAction: action.action}}
        }
    }
    return store;
}
