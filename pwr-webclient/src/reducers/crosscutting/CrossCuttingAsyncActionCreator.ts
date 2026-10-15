import {LoginStatus} from '../../model/LoginStatus';
import {ConsultantClient} from '../profile-new/consultant/ConsultantClient';
import {consultantUpdateAction} from '../profile-new/consultant/actions/ConsultantUpdateAction';
import {StatisticsActionCreator} from '../statistics/StatisticsActionCreator';
import {ViewProfileActionCreator} from '../view/ViewProfileActionCreator';
import {NavigationActionCreator} from '../navigation/NavigationActionCreator';
import {Paths} from '../../Paths';
import {CrossCuttingActionCreator} from './CrossCuttingActionCreator';
import {resetProfileStore} from '../profile-new/profile/actions/ProfileActions';
import {PowerApiError} from '../../clients/PowerHttpClient';
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

    public static AsyncLoadProfile(initials: string) {
        return function(dispatch: ThunkDispatch<any, any, any>) {
            ConsultantClient.instance().getConsultant(initials).then(consultant => {
                dispatch(consultantUpdateAction(consultant));
                dispatch(StatisticsActionCreator.AsyncGetProfileStatistics(initials));
                dispatch(StatisticsActionCreator.AsyncCheckAvailability());
                dispatch(ViewProfileActionCreator.AsyncLoadAllViewProfiles());
            }).catch((error: PowerApiError | string) => {
                // FIXME@nt handle this error.
                console.error('Failed to Load Profile', error);
                // let errorMessage = `Login als ${initials} nicht möglich.`;
                // if (typeof error === 'string') {
                //     if (error.startsWith('InteractionRequiredAuthError: AADSTS50058')) {
                //         // Brave shield prevent setting of a cookie
                //         errorMessage = `Login als ${initials} nicht möglich: Ein Browser-Plugin verhindert das setzen des Session Cookies.`;
                //     }
                // } else if (error.status === 404) {
                //     errorMessage = `Profil für ${initials} existiert nicht.`;
                // }
                // dispatch(CrossCuttingActionCreator.SetLoginError(errorMessage));
                // dispatch(CrossCuttingActionCreator.SetLoginStatus(LoginStatus.REJECTED));
                // dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.APP_ROOT));
            });
        }
    }

    public static AsyncLogInUser(authResponse: AuthenticationResult) {
        return function(dispatch: ThunkDispatch<any, any, any>) {
            if (CrossCuttingAsyncActionCreator.isAdmin(authResponse)) {
                dispatch(AdminActionCreator.AsyncValidateAuthentication());
            }
            dispatch(CrossCuttingActionCreator.SetLoginStatus(LoginStatus.SUCCESS));
            dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.PROFILE_SELECT));
        };
    }

}
