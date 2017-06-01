import {AbstractAction, ChangeStringValueAction} from '../profile/database-actions';
import {ActionType} from '../ActionType';
import {AdminNotification, APIAdminNotification} from '../../model/admin/AdminNotification';
import {ChangeLoginStatusAction, NavigateAction, ReceiveNotifcationsAction, RequestStatusAction} from './admin-actions';
import {AdminState} from '../../model/admin/AdminState';
import * as redux from 'redux';
import {
    getAdminAuthAPIString, getNotificationAPIString, getNotificationTrashAPIString,
    getProfileAPIString
} from '../../API_CONFIG';
import axios, {AxiosResponse} from 'axios';
import {RequestStatus} from '../../Store';
import {Paths} from '../../index';
import {LoginStatus} from '../../model/LoginStatus';

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

    public static RequestNotificationTrashing(): RequestStatusAction {
        return {
            type: ActionType.RequestNotificationTrashing,
            requestStatus: RequestStatus.Pending
        }
    }

    public static RequestNotificationTrashingSuccess(): RequestStatusAction {
        return {
            type: ActionType.RequestNotificationTrashing,
            requestStatus: RequestStatus.Successful
        }
    }

    public static RequestNotificationTrashingFail(): RequestStatusAction {
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

    public static ChangeRequestStatus(to: RequestStatus): RequestStatusAction {
        return {
            type: ActionType.AdminRequestStatus,
            requestStatus: to
        }
    }

    public static ChangeUsername(val: string): ChangeStringValueAction {
        return {
            type: ActionType.ChangeUsername,
            value: val
        }
    }

    public static ChangePassword(val: string): ChangeStringValueAction {
        return {
            type: ActionType.ChangePassword,
            value: val
        }
    }

    public static ChangeLoginStatus(status: LoginStatus): ChangeLoginStatusAction {
        return {
            type: ActionType.ChangeAdminLoginStatus,
            status: status
        }
    }

    public static LogInAdmin() : AbstractAction {
        return {
            type: ActionType.LogInAdmin
        }
    }


    public static AsyncRequestNotifications(username: string, password: string) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            let config = {
                auth: {
                    username: username,
                    password: password
                },
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            };
            dispatch(AdminActionCreator.RequestNotifications());
            axios.get(getNotificationAPIString(), config).then(function(response: AxiosResponse) {
                dispatch(AdminActionCreator.ReceiveNotifications(response.data));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(AdminActionCreator.FailReceiveNotifications());
            });
        };
    }

    public static AsyncRequestTrashedNotifications(username: string, password: string) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            let config = {
                auth: {
                    username: username,
                    password: password
                },
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            };
            dispatch(AdminActionCreator.RequestTrashedNotifications());
            axios.get(getNotificationTrashAPIString(), config).then(function(response: AxiosResponse) {
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
    public static AsyncTrashNotifications(ids: Array<number>, username: string, password: string) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            let config = {
                auth: {
                    username: username,
                    password: password
                },
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            };
            dispatch(AdminActionCreator.RequestNotificationTrashing());
            axios.put(getNotificationTrashAPIString(), ids, config).then(function(response: AxiosResponse) {
                dispatch(AdminActionCreator.RequestNotificationTrashingSuccess());
                dispatch(AdminActionCreator.AsyncRequestNotifications(username, password));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(AdminActionCreator.RequestNotificationTrashingFail());
            });
        };
    }

    public static AsyncDeleteTrashed(username: string, password: string) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            let config = {
                auth: {
                    username: username,
                    password: password
                },
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            };
            dispatch(AdminActionCreator.RequestNotificationTrashing());
            axios.delete(getNotificationTrashAPIString(), config).then(function(response: AxiosResponse) {
                dispatch(AdminActionCreator.RequestNotificationTrashingSuccess());
                dispatch(AdminActionCreator.AsyncRequestTrashedNotifications(username, password));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(AdminActionCreator.RequestNotificationTrashingFail());
            });
        };
    }

    public static AsyncNavigateToInbox(username: string, password: string) {
        return function(dispatch: redux.Dispatch<AdminState>){
            dispatch(AdminActionCreator.AsyncRequestNotifications(username, password));
            dispatch(AdminActionCreator.NavigateTo(Paths.ADMIN_INBOX))
        }
    }

    public static AsyncNavigateToTrashbox(username: string, password: string) {
        return function(dispatch: redux.Dispatch<AdminState>){
            dispatch(AdminActionCreator.AsyncRequestTrashedNotifications(username, password));
            dispatch(AdminActionCreator.NavigateTo(Paths.ADMIN_TRASHBOX))
        }
    }

    public static AsyncNotificationInvokeDelete(notificationId: number, username: string, password: string) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            let config = {
                auth: {
                    username: username,
                    password: password
                },
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            };
            dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Pending));
            axios.delete(getNotificationAPIString() + "/" + notificationId, config).then(function(response: AxiosResponse) {
                dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Successful));
                dispatch(AdminActionCreator.AsyncRequestNotifications(username, password));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Failiure));
            });
        };
    }

    public static AsyncNotificationInvokeOK(notificationId: number, username: string, password: string) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Pending));
            let config = {
                auth: {
                    username: username,
                    password: password
                },
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            };
            axios.put(getNotificationAPIString() + "/" + notificationId, null, config).then(function(response: AxiosResponse) {
                dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Successful));
                dispatch(AdminActionCreator.AsyncRequestNotifications(username, password));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Failiure));
            });
        };
    }

    public static AsyncNotificationInvokeEdit(notification: AdminNotification, username: string, password: string) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            let config = {
                auth: {
                    username: username,
                    password: password
                },
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            };
            dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Pending));
            axios.patch(getNotificationAPIString(), notification.toApi(), config).then(function(response: AxiosResponse) {
                dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Successful));
                dispatch(AdminActionCreator.AsyncRequestNotifications(username, password));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Failiure));
            });
        };
    }

    public static AsyncValidateAuthentication(username: string, password: string) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            let config = {
                auth: {
                    username: username,
                    password: password
                },
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            };
            axios.head(getAdminAuthAPIString(), config).then(function(response: AxiosResponse) {
                dispatch(AdminActionCreator.ChangeLoginStatus(LoginStatus.INITIALS));
                dispatch(AdminActionCreator.AsyncRequestNotifications(username, password));
                dispatch(AdminActionCreator.LogInAdmin());
            }).catch(function(error:any) {
                dispatch(AdminActionCreator.ChangeLoginStatus(LoginStatus.REJECTED));
                console.error(error);
            });
        };
    }
}