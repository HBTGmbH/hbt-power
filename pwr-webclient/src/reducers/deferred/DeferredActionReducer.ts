import {DeferredStore, emptyDeferredStore} from './DeferredStore';
import {ConfirmDeferredActionAction, DeferActionAction, RejectDeferredActionAction} from './DeferredActions';
import {ActionType} from '../ActionType';

type DeferredActionType = ConfirmDeferredActionAction | RejectDeferredActionAction | DeferActionAction;

export function reduceDeferredAction(store = emptyDeferredStore, action: DeferredActionType): DeferredStore {
    switch (action.type) {
        case ActionType.ConfirmDeferredAction:
        case ActionType.RejectDeferredAction:
            return {...store, ...emptyDeferredStore};
        case ActionType.DeferAction: {
            return {
                ...store, ...{
                    deferredAction: action.action,
                    dialogActionNOK: action.actionNOK,
                    dialogActionOK: action.actionOK,
                    dialogContent: action.msg,
                    dialogHeader: action.header
                }
            };
        }
    }
    return store;
}
