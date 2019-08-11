import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import {LoginStatus} from '../../model/LoginStatus';
import {ConsultantClient} from '../profile-new/consultant/ConsultantClient';
import {consultantUpdateAction} from '../profile-new/consultant/actions/ConsultantUpdateAction';
import {StatisticsActionCreator} from '../statistics/StatisticsActionCreator';
import {ViewProfileActionCreator} from '../view/ViewProfileActionCreator';
import {TemplateActionCreator} from '../template/TemplateActionCreator';
import {COOKIE_INITIALS_NAME} from '../../model/PwrConstants';
import {NavigationActionCreator} from '../navigation/NavigationActionCreator';
import {Paths} from '../../Paths';
import {CrossCuttingActionCreator} from './CrossCuttingActionCreator';
import {resetProfileStore} from '../profile-new/profile/actions/ProfileActions';
import {PowerApiError} from '../../clients/PowerHttpClient';
import {ProfileDataAsyncActionCreator} from '../profile-new/profile/ProfileDataAsyncActionCreator';


export namespace CrossCuttingAsyncActionCreator {

    export function AsyncLogOutUser() {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            window.localStorage.removeItem(COOKIE_INITIALS_NAME);
            dispatch(CrossCuttingActionCreator.SetLoginStatus(LoginStatus.INITIALS));
            dispatch(resetProfileStore());
            dispatch(ViewProfileActionCreator.ResetViewState());
        }
    }

    export function AsyncLogInUser(initials: string, navTarget?: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            if (!initials || initials.length <= 0) {
                dispatch(CrossCuttingActionCreator.SetLoginError('No Initials Set.'));
                dispatch(CrossCuttingActionCreator.SetLoginStatus(LoginStatus.REJECTED));
            } else {
                ConsultantClient.instance().getConsultant(initials).then(consultant => {
                    dispatch(consultantUpdateAction(consultant));
                    dispatch(CrossCuttingActionCreator.SetLoginStatus(LoginStatus.SUCCESS));
                    dispatch(StatisticsActionCreator.AsyncGetProfileStatistics(initials));
                    dispatch(StatisticsActionCreator.AsyncCheckAvailability());
                    dispatch(ViewProfileActionCreator.AsyncLoadAllViewProfiles());
                    dispatch(TemplateActionCreator.AsyncLoadAllTemplates());
                    window.localStorage.setItem(COOKIE_INITIALS_NAME, initials);
                    if (navTarget) {
                        dispatch(NavigationActionCreator.AsyncNavigateTo(navTarget));
                    }
                }).catch((error: PowerApiError) => {
                    let errorMessage = `Can't login as ${initials}`;
                    if (error.status === 404) {
                        errorMessage = `Profile for ${initials} does not exist.`;
                    }
                    dispatch(CrossCuttingActionCreator.SetLoginError(errorMessage));
                    dispatch(CrossCuttingActionCreator.SetLoginStatus(LoginStatus.REJECTED));
                    dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.APP_ROOT));
                });
            }
        };
    }

}
