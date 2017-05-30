import {AbstractAction} from '../profile/database-actions';
import {ActionType} from '../ActionType';
import {APIAdminNotification} from '../../model/admin/AdminNotification';
import {NavigateAction, ReceiveNotifcationsAction, TrashNotificationAction} from './admin-actions';
import {AdminState} from '../../model/admin/AdminState';
import * as redux from 'redux';
import {getNotificationAPIString, getNotificationTrashAPIString, getProfileAPIString} from '../../API_CONFIG';
import axios, {AxiosResponse} from 'axios';
import {RequestStatus} from '../../Store';
import {Paths} from '../../index';

export class AdminActionCreator {
    public static RequestNotifications(): AbstractAction {
        return {
            type: ActionType.RequestNotifications
        }
    }

    public static ReceiveNotifications(notifications: Array<APIAdminNotification>): ReceiveNotifcationsAction {
        return {
            type: ActionType.ReceiveNotifications,
            notifications: notifications
        }
    }

    public static FailReceiveNotifications(): AbstractAction {
        return {
            type: ActionType.FailRequestNotifications
        }
    }

    public static RequestTrashedNotifications(): AbstractAction {
        return {
            type: ActionType.RequestTrashedNotifications
        }
    }

    public static ReceiveTrashedNotifications(notifications: Array<APIAdminNotification>): ReceiveNotifcationsAction {
        return {
            type: ActionType.ReceiveTrashedNotifications,
            notifications: notifications
        }
    }

    public static FailReceiveTrashedNotifications(): AbstractAction {
        return {
            type: ActionType.FailRequestTrashedNotifications
        }
    }

    public static RequestNotificationTrashing(): TrashNotificationAction {
        return {
            type: ActionType.RequestNotificationTrashing,
            requestStatus: RequestStatus.Pending
        }
    }

    public static RequestNotificationTrashingSuccess(): TrashNotificationAction {
        return {
            type: ActionType.RequestNotificationTrashing,
            requestStatus: RequestStatus.Successful
        }
    }

    public static RequestNotificationTrashingFail(): TrashNotificationAction {
        return {
            type: ActionType.RequestNotificationTrashing,
            requestStatus: RequestStatus.Failiure
        }
    }

    public static NavigateTo(to: string): NavigateAction {
        return {
            type: ActionType.AdminNavigate,
            location: to
        }
    }


    public static AsyncRequestNotifications() {
        return function(dispatch: redux.Dispatch<AdminState>) {
            dispatch(AdminActionCreator.RequestNotifications());
            axios.get(getNotificationAPIString()).then(function(response: AxiosResponse) {
                dispatch(AdminActionCreator.ReceiveNotifications(response.data));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(AdminActionCreator.FailReceiveNotifications());
            });
        };
    }

    public static AsyncRequestTrashedNotifications() {
        return function(dispatch: redux.Dispatch<AdminState>) {
            dispatch(AdminActionCreator.RequestTrashedNotifications());
            axios.get(getNotificationTrashAPIString()).then(function(response: AxiosResponse) {
                dispatch(AdminActionCreator.ReceiveTrashedNotifications(response.data));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(AdminActionCreator.FailReceiveTrashedNotifications());
            });
        };
    }

    /**
     * Invokes trashing of Notifications
     * @param ids
     * @returns {(dispatch:redux.Dispatch<AdminState>)=>undefined}
     * @constructor
     */
    public static AsyncTrashNotifications(ids: Array<number>) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            dispatch(AdminActionCreator.RequestNotificationTrashing());
            axios.put(getNotificationTrashAPIString(), ids).then(function(response: AxiosResponse) {
                dispatch(AdminActionCreator.RequestNotificationTrashingSuccess());
                dispatch(AdminActionCreator.AsyncRequestNotifications());
            }).catch(function(error:any) {
                console.error(error);
                dispatch(AdminActionCreator.RequestNotificationTrashingFail());
            });
        };
    }

    public static AsyncDeleteTrashed() {
        return function(dispatch: redux.Dispatch<AdminState>) {
            dispatch(AdminActionCreator.RequestNotificationTrashing());
            axios.delete(getNotificationTrashAPIString()).then(function(response: AxiosResponse) {
                dispatch(AdminActionCreator.RequestNotificationTrashingSuccess());
                dispatch(AdminActionCreator.AsyncRequestTrashedNotifications());
            }).catch(function(error:any) {
                console.error(error);
                dispatch(AdminActionCreator.RequestNotificationTrashingFail());
            });
        };
    }

    public static AsyncNavigateToInbox() {
        return function(dispatch: redux.Dispatch<AdminState>){
            dispatch(AdminActionCreator.AsyncRequestNotifications());
            dispatch(AdminActionCreator.NavigateTo(Paths.ADMIN_INBOX))
        }
    }

    public static AsyncNavigateToTrashbox() {
        return function(dispatch: redux.Dispatch<AdminState>){
            dispatch(AdminActionCreator.AsyncRequestTrashedNotifications());
            dispatch(AdminActionCreator.NavigateTo(Paths.ADMIN_TRASHBOX))
        }
    }
}