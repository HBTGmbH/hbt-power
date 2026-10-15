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

function SetRequestPending(requestPending: boolean): SetRequestPendingAction {
    return {
        type: ActionType.SetRequestPending,
        requestPending: requestPending
    };
}

export const CrossCuttingActionCreator = {
    startRequest: () => SetRequestPending(true),
    endRequest: () => SetRequestPending(false),
    SetLoginStatus: (loginStatus: LoginStatus) => ({
        type: ActionType.SetLoginStatus,
        loginStatus
    }),
    SetLoginError: (error: string) => ({
        type: ActionType.SetLoginError,
        error
    })
}
