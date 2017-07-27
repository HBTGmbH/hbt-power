import {AbstractAction, ChangeStringValueAction} from '../profile/database-actions';
import {ActionType} from '../ActionType';
import {APIAdminNotification} from '../../model/admin/AdminNotification';
import {
    ChangeLoginStatusAction,
    ChangeRequestStatusAction,
    NavigateAction,
    ReceiveAllConsultantsAction,
    ReceiveConsultantAction,
    ReceiveNotificationsAction
} from './admin-actions';
import {AdminState} from '../../model/admin/AdminState';
import * as redux from 'redux';
import {
    getAdminAuthAPIString,
    getAllConsultantsString,
    getNotificationAPIString,
    getNotificationTrashAPIString,
    postConsultantActionString
} from '../../API_CONFIG';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {ApplicationState, RequestStatus} from '../../Store';
import {LoginStatus} from '../../model/LoginStatus';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {APIConsultant} from '../../model/APIProfile';
import {ProfileAsyncActionCreator} from '../profile/ProfileAsyncActionCreator';
import {StatisticsActionCreator} from '../statistics/StatisticsActionCreator';
import {isNullOrUndefined} from 'util';
import {COOKIE_ADMIN_EXPIRATION_TIME, COOKIE_ADMIN_PASSWORD, COOKIE_ADMIN_USERNAME} from '../../model/PwrConstants';
import * as Cookies from 'js-cookie';
import {Paths} from '../../Paths';
import {ProfileEntryNotification} from '../../model/admin/ProfileEntryNotification';

export class AdminActionCreator {
    private static logAxiosError(error: any) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(error.response.data);
            console.error(error.response.status);
            console.error(error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.error(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error', error.message);
        }
    }


    public static RequestNotifications(): AbstractAction {
        return {
            type: ActionType.RequestNotifications
        }
    }

    public static ReceiveNotifications(notifications: Array<APIAdminNotification>): ReceiveNotificationsAction {
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

    public static ReceiveTrashedNotifications(notifications: Array<APIAdminNotification>): ReceiveNotificationsAction {
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

    public static RequestNotificationTrashing(): ChangeRequestStatusAction {
        return {
            type: ActionType.RequestNotificationTrashing,
            requestStatus: RequestStatus.Pending
        }
    }

    public static RequestNotificationTrashingSuccess(): ChangeRequestStatusAction {
        return {
            type: ActionType.RequestNotificationTrashing,
            requestStatus: RequestStatus.Successful
        }
    }

    public static RequestNotificationTrashingFail(): ChangeRequestStatusAction {
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

    public static ChangeRequestStatus(to: RequestStatus): ChangeRequestStatusAction {
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
                AdminActionCreator.logAxiosError(error);
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
                AdminActionCreator.logAxiosError(error);
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
                AdminActionCreator.logAxiosError(error);
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
                AdminActionCreator.logAxiosError(error);
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
                AdminActionCreator.logAxiosError(error);
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
                AdminActionCreator.logAxiosError(error);
                dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Failiure));
            });
        };
    }

    public static AsyncNotificationInvokeEdit(notification: ProfileEntryNotification, username: string, password: string) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            let config = {
                auth: {
                    username: username,
                    password: password
                },
                    headers: {'X-Requested-With': 'XMLHttpRequest'}
            };
            dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Pending));
            axios.patch(getNotificationAPIString(), notification.toAPI(), config).then(function(response: AxiosResponse) {
                dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Successful));
                dispatch(AdminActionCreator.AsyncRequestNotifications(username, password));
            }).catch(function(error:any) {
                AdminActionCreator.logAxiosError(error);
                dispatch(AdminActionCreator.ChangeRequestStatus(RequestStatus.Failiure));
            });
        };
    }


    public static AsyncRestoreFromCookies() {
        return function(dispatch: redux.Dispatch<AdminState>) {
            const storedUsername = Cookies.get(COOKIE_ADMIN_USERNAME);
            const storedPassword = Cookies.get(COOKIE_ADMIN_PASSWORD);
            Promise.all([
                dispatch(AdminActionCreator.ChangeUsername(storedUsername)),
                dispatch(AdminActionCreator.ChangePassword(storedPassword))]
            ).then(() => dispatch(AdminActionCreator.AsyncValidateAuthentication(storedUsername, storedPassword, true)));
        }
    }

    /**
     *
     * @param username
     * @param password
     * @param rememberLogin
     * @returns {(dispatch:redux.Dispatch<AdminState>)=>undefined}
     * @constructor
     */
    public static AsyncValidateAuthentication(username: string, password: string, rememberLogin?: boolean) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            let config = {
                auth: {
                    username: username,
                    password: password
                },
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            };
            if(isNullOrUndefined(rememberLogin)) rememberLogin = false;
            axios.head(getAdminAuthAPIString(), config).then(function(response: AxiosResponse) {
                if(rememberLogin) {
                    Cookies.set(COOKIE_ADMIN_USERNAME, username, COOKIE_ADMIN_EXPIRATION_TIME);
                    Cookies.set(COOKIE_ADMIN_PASSWORD, password, COOKIE_ADMIN_EXPIRATION_TIME);
                }
                dispatch(AdminActionCreator.ChangeLoginStatus(LoginStatus.INITIALS));
                dispatch(AdminActionCreator.AsyncRequestNotifications(username, password));
                dispatch(AdminActionCreator.AsyncGetAllConsultants());
                dispatch(AdminActionCreator.LogInAdmin());
            }).catch(function(error:any) {
                dispatch(AdminActionCreator.ChangeLoginStatus(LoginStatus.REJECTED));
                // Clear possible cookies
                dispatch(AdminActionCreator.LogOutAdmin());
                AdminActionCreator.logAxiosError(error);
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
                AdminActionCreator.logAxiosError(error);
            });
        };
    }

    public static AsyncRedirectToUser(initials: string) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            dispatch(ProfileAsyncActionCreator.logInUser(initials));
        };
    }

    /**
     * Creates a consultant.
     * @param consultantInfo that must not be null. Also, consultantInfo.birthDate() must not be null either.
     * @returns {(dispatch:redux.Dispatch<AdminState>)=>undefined}
     * @constructor
     */
    public static AsyncCreateConsultant(consultantInfo: ConsultantInfo) {
        return function(dispatch: redux.Dispatch<AdminState>) {
            let apiConsultant: APIConsultant = {
                profile: null,
                initials: consultantInfo.initials(),
                firstName: consultantInfo.firstName(),
                lastName: consultantInfo.lastName(),
                title: consultantInfo.title(),
                birthDate: !isNullOrUndefined(consultantInfo.birthDate()) ? consultantInfo.birthDate().toISOString() : null
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
                AdminActionCreator.logAxiosError(error);
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
                title: consultantInfo.title(),
                birthDate: !isNullOrUndefined(consultantInfo.birthDate()) ? consultantInfo.birthDate().toISOString() : null
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
                AdminActionCreator.logAxiosError(error);
            });
            axios.post(postConsultantActionString(), apiConsultant, config).then(function (response: AxiosResponse) {
                config.params.action = 'birthdate';
                axios.post(postConsultantActionString(), apiConsultant, config).then(function (response: AxiosResponse) {
                    dispatch(AdminActionCreator.ReceiveConsultant(consultantInfo));
                }).catch(function (error: any) {
                    console.error(error);
                });
            }).catch(function (error: any) {
                AdminActionCreator.logAxiosError(error);
            });
        }
    }
}