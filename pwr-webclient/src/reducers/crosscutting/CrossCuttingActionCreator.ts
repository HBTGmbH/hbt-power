import {AbstractAction} from '../profile/database-actions';
import {ActionType} from '../ActionType';

export interface SetRequestPendingAction extends AbstractAction {
    requestPending: boolean;
}

export namespace CrossCuttingActionCreator {

    export function startRequest() {
        return SetRequestPending(true);
    }

    export function endRequest() {
        return SetRequestPending(false);
    }

    function SetRequestPending(requestPending: boolean): SetRequestPendingAction {
        return {
            type: ActionType.SetRequestPending,
            requestPending: requestPending
        }
    }
}