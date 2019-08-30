import {LoginStatus} from '../../model/LoginStatus';
import {ActionType} from '../ActionType';
import {AbstractAction} from '../BaseActions';

export interface SetRequestPendingAction extends AbstractAction {
    type: ActionType.SetRequestPending;
    requestPending: boolean;
}

export interface SetLoginStatusAction {
    type: ActionType.SetLoginStatus;
    loginStatus: LoginStatus;
}

export interface SetLoginErrorAction {
    type: ActionType.SetLoginError;
    error: string;
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
        };
    }

    export function SetLoginStatus(loginStatus: LoginStatus): SetLoginStatusAction {
        return {
            type: ActionType.SetLoginStatus,
            loginStatus
        }
    }

    export function SetLoginError(error: string): SetLoginErrorAction {
        return {
            type: ActionType.SetLoginError,
            error
        }
    }
}
