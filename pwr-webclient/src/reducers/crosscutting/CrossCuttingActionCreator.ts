import {LoginStatus} from '../../model/LoginStatus';
import {ActionType} from '../ActionType';
import {AbstractAction} from '../BaseActions';

export interface ChangePendingRequestsAction extends AbstractAction {
    type: ActionType.ChangePendingRequests;
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

export const CrossCuttingActionCreator = {
    startRequest: (): ChangePendingRequestsAction => ({type: ActionType.ChangePendingRequests, delta: 1}),
    endRequest: (): ChangePendingRequestsAction => ({type: ActionType.ChangePendingRequests, delta: -1}),
    openSessionExpiredDialog: (): AbstractAction => ({type: ActionType.OpenSessionExpiredDialog}),
    closeSessionExpiredDialog: (): AbstractAction => ({type: ActionType.CloseSessionExpiredDialog}),
    SetLoginStatus: (loginStatus: LoginStatus) => ({
        type: ActionType.SetLoginStatus,
        loginStatus
    }),
    SetLoginError: (error: string) => ({
        type: ActionType.SetLoginError,
        error
    })
}
