import {CONFIG} from '../../Config';
import {LoginStatus} from '../../model/LoginStatus';
import {ConsultantClient} from '../profile-new/consultant/ConsultantClient';
import {consultantUpdateAction} from '../profile-new/consultant/actions/ConsultantUpdateAction';
import {StatisticsActionCreator} from '../statistics/StatisticsActionCreator';
import {ViewProfileActionCreator} from '../view/ViewProfileActionCreator';
import {NavigationActionCreator, navigateReplacing, PWR_HISTORY} from '../navigation/NavigationActionCreator';
import {Alerts} from '../../utils/Alerts';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Paths} from '../../Paths';
import {CrossCuttingActionCreator} from './CrossCuttingActionCreator';
import {resetProfileStore} from '../profile-new/profile/actions/ProfileActions';
import {ThunkDispatch} from 'redux-thunk';
import {AdminActionCreator} from '../admin/AdminActionCreator';
import {AuthenticationResult} from '@azure/msal-common';
import {OIDCService} from '../../OIDCService';


export class CrossCuttingAsyncActionCreator {

    static isAdmin( authResponse: AuthenticationResult): boolean {
        if (!authResponse.account) {
            return false;
        }
        if (!authResponse.account.idTokenClaims.roles) {
            return false;
        }
        const roles = authResponse.account.idTokenClaims.roles;
        return roles.indexOf('Power.Admin') >= 0;
    }

    public static AsyncLogOutUser() {
        return function(dispatch: ThunkDispatch<any, any, any>) {
            dispatch(CrossCuttingActionCreator.SetLoginStatus(LoginStatus.INITIALS));
            dispatch(resetProfileStore());
            dispatch(ViewProfileActionCreator.ResetViewState());
            // The same logout for the admin area (#211)
            dispatch(AdminActionCreator.LogOutAdmin());
            OIDCService.instance().logout();
        };
    }

    public static AsyncRenewLogin(authResponse: AuthenticationResult) {
        return function(dispatch: ThunkDispatch<any, any, any>) {
            // If the user is an admin => validate admin authentication
            if (CrossCuttingAsyncActionCreator.isAdmin(authResponse)) {
                dispatch(AdminActionCreator.AsyncValidateAuthentication());
            }
            // Always make sure that the login status is set properly, even if its an admin
            dispatch(CrossCuttingActionCreator.SetLoginStatus(LoginStatus.SUCCESS));
            // ConsultantClient.instance().getConsultant(initials)
            //     .then(consultant => {
            //         dispatch(consultantUpdateAction(consultant));
            //         dispatch(CrossCuttingActionCreator.SetLoginStatus(LoginStatus.SUCCESS));
            //         dispatch(StatisticsActionCreator.AsyncGetProfileStatistics(initials));
            //         dispatch(StatisticsActionCreator.AsyncCheckAvailability());
            //         dispatch(ViewProfileActionCreator.AsyncLoadAllViewProfiles());
            //     })
            //     .catch((error: PowerApiError | string) => {
            //         console.error('Failed to silently login user', error);
            //         dispatch(CrossCuttingActionCreator.SetLoginStatus(LoginStatus.INITIALS));
            //         dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.APP_ROOT));
            //     });
        };
    }

    /**
     * The profile of a colleague is only read (#350): its statistics and view profiles are not the user's to load
     */
    public static AsyncLoadProfile(initials: string, readOnly: boolean = false) {
        return function(dispatch: ThunkDispatch<any, any, any>) {
            ConsultantClient.instance().findConsultant(initials).then(consultant => {
                if (!consultant) {
                    // Unknown initials, e.g. from an old link: back to the selection, a clear message instead of errors (#135)
                    Alerts.showError(PowerLocalize.getFormatted('ProfileSelect.NoProfileFor', initials));
                    navigateReplacing(Paths.START, dispatch);
                    return;
                }
                dispatch(consultantUpdateAction(consultant));
                dispatch(StatisticsActionCreator.AsyncCheckAvailability());
                if (!readOnly) {
                    dispatch(StatisticsActionCreator.AsyncGetProfileStatistics(initials));
                    dispatch(ViewProfileActionCreator.AsyncLoadAllViewProfiles());
                }
            }).catch(error => console.error('Failed to load profile', error));
        }
    }

    /**
     * Local dev mode only: log in without Azure, as a user with admin rights, or as the user of CONFIG.LOCAL_USER
     * without (#350), who like in production doesn't ask the admin check.
     */
    public static AsyncLogInLocalUser(navigateToStart: boolean) {
        return function(dispatch: ThunkDispatch<any, any, any>) {
            if (!CONFIG.LOCAL_USER) {
                dispatch(AdminActionCreator.AsyncValidateAuthentication());
            }
            dispatch(CrossCuttingActionCreator.SetLoginStatus(LoginStatus.SUCCESS));
            if (navigateToStart) {
                dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.START));
            }
        };
    }

    public static AsyncLogInUser(authResponse: AuthenticationResult) {
        return function(dispatch: ThunkDispatch<any, any, any>) {
            if (CrossCuttingAsyncActionCreator.isAdmin(authResponse)) {
                dispatch(AdminActionCreator.AsyncValidateAuthentication());
            }
            dispatch(CrossCuttingActionCreator.SetLoginStatus(LoginStatus.SUCCESS));
            // MSAL returns to the page the login started on (#323): only the login page itself leads to the start
            if (PWR_HISTORY.location.pathname === Paths.APP_ROOT) {
                dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.START));
            }
        };
    }

}
