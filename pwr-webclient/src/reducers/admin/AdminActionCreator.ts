import {AbstractAction, ChangeStringValueAction} from '../profile/database-actions';
import {ActionType} from '../ActionType';
import {AdminNotification, APIAdminNotification} from '../../model/admin/AdminNotification';
import {
    ChangeLoginStatusAction, NavigateAction, ReceiveAllConsultantsAction, ReceiveConsultantAction,
    ReceiveNotifcationsAction,
    RequestStatusAction
} from './admin-actions';
import {AdminState} from '../../model/admin/AdminState';
import * as redux from 'redux';
import {
    getAdminAuthAPIString, getAllConsultantsString, getNotificationAPIString,
    getNotificationTrashAPIString, postConsultantActionString
} from '../../API_CONFIG';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {ApplicationState, RequestStatus} from '../../Store';
import {Paths} from '../../index';
import {LoginStatus} from '../../model/LoginStatus';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {APIConsultant} from '../../model/APIProfile';
import {ProfileAsyncActionCreator} from '../profile/ProfileAsyncActionCreator';
import {StatisticsReducer} from '../statistics/StatisticsReducer';
import {StatisticsActionCreator} from '../statistics/StatisticsActionCreator';
import {AdminReducer} from './AdminReducer';

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

    public static LogOutAdmin(): AbstractAction {
        return {
            type: ActionType.LogOutAdmin
        }
    }

    public static ReceiveAllConsultants(consultants: Array<ConsultantInfo>): ReceiveAllConsultantsAction {
        return {
            type: ActionType.ReceiveAllConsultants,
            consultants: consultants
        }
    }

    public static ReceiveConsultant(consultant: ConsultantInfo): ReceiveConsultantAction {
        return {
            type: ActionType.ReceiveSingleConsultant,
            consultant: consultant
        }
    }

    public static AsyncNavigateToStatistics() {
        return function(dispatch: redux.Dispatch<ApplicationState>) {
            dispatch(StatisticsActionCreator.AsyncRequestSkillUsages());
            dispatch(AdminActionCreator.NavigateTo(Paths.ADMIN_STATISTICS_SKILL));
        }
    }

    public static AsyncNavigateToNetwork() {
        return function(dispatch: redux.Dispatch<ApplicationState>) {
            dispatch(StatisticsActionCreator.AsyncRequestNetwork());
            dispatch(AdminActionCreator.NavigateTo(Paths.ADMIN_STATISTICS_NETWORK));
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
                dispatch(AdminActionCreator.AsyncGetAllConsultants());
                dispatch(AdminActionCreator.LogInAdmin());
            }).catch(function(error:any) {
                dispatch(AdminActionCreator.ChangeLoginStatus(LoginStatus.REJECTED));
                console.error(error);
            });
        };
    }

    public static AsyncGetAllConsultants() {
        return function(dispatch: redux.Dispatch<AdminState>) {
            axios.get(getAllConsultantsString()).then(function(response: AxiosResponse) {
                let apiConsultants: Array<APIConsultant> = response.data;
                let consultants = apiConsultants.map((value, index, array) => ConsultantInfo.fromAPI(value));
                dispatch(AdminActionCreator.ReceiveAllConsultants(consultants));
            }).catch(function(error:any) {
                console.error(error);
            });
        };
    }

    public static AsyncRedirectToUser(initials: string) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            dispatch(ProfileAsyncActionCreator.logInUser(initials));
        };
    }

    public static AsyncCreateConsultant(consultantInfo: ConsultantInfo) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            let apiConsultant: APIConsultant = {
                profile: null,
                initials: consultantInfo.initials(),
                firstName: consultantInfo.firstName(),
                lastName: consultantInfo.lastName(),
                title: consultantInfo.title()
            };
            let config: AxiosRequestConfig = {
                params: {
                    action: 'new'
                }
            };
            axios.post(postConsultantActionString(), apiConsultant, config).then(function (response: AxiosResponse) {
                console.log(response);
                axios.get(response.headers.location).then(function (response: AxiosResponse) {
                    let res: APIConsultant = response.data;
                    dispatch(AdminActionCreator.ReceiveConsultant(ConsultantInfo.fromAPI(res)));
                });
            }).catch(function (error: any) {
                console.error(error);
            });
        }
    }

    public static AsyncUpdateConsultant(consultantInfo: ConsultantInfo) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            let apiConsultant: APIConsultant = {
                profile: null,
                initials: consultantInfo.initials(),
                firstName: consultantInfo.firstName(),
                lastName: consultantInfo.lastName(),
                title: consultantInfo.title()
            };
            let config: AxiosRequestConfig = {
                params: {
                    action: 'name'
                }
            };
            axios.post(postConsultantActionString(), apiConsultant, config).then(function (response: AxiosResponse) {
                config.params.action = 'title';
                axios.post(postConsultantActionString(), apiConsultant, config).then(function (response: AxiosResponse) {
                    dispatch(AdminActionCreator.ReceiveConsultant(consultantInfo));
                }).catch(function (error: any) {
                    console.error(error);
                });
            }).catch(function (error: any) {
                console.error(error);
            });
        }
    }
}