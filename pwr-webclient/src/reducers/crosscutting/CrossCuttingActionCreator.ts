import {LoginStatus} from '../../model/LoginStatus';
import {ActionType} from '../ActionType';
import {AbstractAction} from '../BaseActions';

export interface SetRequestPendingAction extends AbstractAction {
    type: ActionType.SetRequestPending;
    requestPending: boolean;
}

export interface ChangeBackgroundRequestsAction extends AbstractAction {
    type: ActionType.ChangeBackgroundRequests;
    /** +1 when one starts, -1 when it ends */
    delta: number;
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
    startBackgroundRequest: (): ChangeBackgroundRequestsAction => ({type: ActionType.ChangeBackgroundRequests, delta: 1}),
    endBackgroundRequest: (): ChangeBackgroundRequestsAction => ({type: ActionType.ChangeBackgroundRequests, delta: -1}),
    SetLoginStatus: (loginStatus: LoginStatus) => ({
        type: ActionType.SetLoginStatus,
        loginStatus
    }),
    SetLoginError: (error: string) => ({
        type: ActionType.SetLoginError,
        error
    })
}
