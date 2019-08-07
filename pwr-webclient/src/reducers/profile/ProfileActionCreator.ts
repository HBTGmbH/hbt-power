import {APIRequestType} from '../../Store';
import {AbstractAction, ChangeStringValueAction, ReceiveAPIResponseAction} from './database-actions';
import {ActionType} from '../ActionType';

export class ProfileActionCreator {

    /**
     * Creates an action that update the state so the received consultant profile is used to replace
     * the current profile.
     * @param payload
     * @param reqType
     */
    public static APIRequestSuccessful(payload: any, reqType: APIRequestType): ReceiveAPIResponseAction {
        return {
            type: ActionType.APIRequestSuccess,
            payload: payload,
            requestType: reqType
        };
    }

    public static logOutUser(): AbstractAction {
        return {
            type: ActionType.LogOutUser
        };
    }

    public static FailLogin(): AbstractAction {
        return {
            type: ActionType.UserLoginFailed
        };
    }

    public static SetUserInitials(initials: string): ChangeStringValueAction {
        return {
            type: ActionType.SetUserInitials,
            value: initials
        };
    }

    public static ClearUserInitials(): AbstractAction {
        return {
            type: ActionType.ClearUserInitials
        }
    }
}


