import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import {APIRequestType} from '../../Store';
import {ProfileActionCreator} from './ProfileActionCreator';
import {StatisticsActionCreator} from '../statistics/StatisticsActionCreator';
import {ViewProfileActionCreator} from '../view/ViewProfileActionCreator';
import {NavigationActionCreator} from '../navigation/NavigationActionCreator';
import {Paths} from '../../Paths';
import {isNullOrUndefined} from 'util';
import {COOKIE_INITIALS_NAME} from '../../model/PwrConstants';
import {ProfileServiceError} from '../../model/ProfileServiceError';
import {TemplateActionCreator} from '../template/TemplateActionCreator';
import {ProfileServiceClient} from '../../clients/ProfileServiceClient';
import {ProfileDataAsyncActionCreator} from '../profile-new/profile/ProfileDataAsyncActionCreator';
import {ConsultantClient} from '../profile-new/consultant/ConsultantClient';
import {consultantUpdateAction} from '../profile-new/consultant/actions/ConsultantUpdateAction';
import {Alerts} from '../../utils/Alerts';

const profileServiceClient = ProfileServiceClient.instance();

const succeedCall = (type: APIRequestType, dispatch: redux.Dispatch<ApplicationState>) => {
    return (data: any) => dispatch(ProfileActionCreator.APIRequestSuccessful(data, type));
};

export class ProfileAsyncActionCreator {

    private static handleProfileServiceError(error: any, errorCause: string) {
        if (error.response) {
            let serviceError = error.response.data as ProfileServiceError;
            Alerts.showError(errorCause + ': ' + serviceError.message);
            console.error(error.response.data);
            console.error(error.response.status);
            console.error(error.response.headers);
        } else if (error.request) {
            console.error(error.request);
            Alerts.showError('An unknown error occurred.');
        } else {
            Alerts.showError('An unknown error occurred.');
        }
    }

    public static requestAllNameEntities() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            dispatch(ProfileAsyncActionCreator.requestQualifications());
            dispatch(ProfileAsyncActionCreator.requestLanguages());
            dispatch(ProfileAsyncActionCreator.requestEducations());
            dispatch(ProfileAsyncActionCreator.requestTrainings());
            dispatch(ProfileAsyncActionCreator.requestSectors());
            dispatch(ProfileAsyncActionCreator.requestCompanies());
            dispatch(ProfileAsyncActionCreator.requestProjectRoles());
            dispatch(ProfileAsyncActionCreator.requestKeySkills());
            dispatch(ProfileAsyncActionCreator.requestCareers());
        };
    }

    public static requestLanguages() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.getLanguageSuggestions()
                .then(succeedCall(APIRequestType.RequestLanguages, dispatch))
                .catch(console.error);
        };
    }

    public static requestEducations() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.getEducationSuggestions()
                .then(succeedCall(APIRequestType.RequestEducations, dispatch))
                .catch(console.error);
        };
    }

    public static requestQualifications() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.getQualificationSuggestions()
                .then(succeedCall(APIRequestType.RequestQualifications, dispatch))
                .catch(console.error);
        };
    }

    public static requestTrainings() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.getTrainingSuggestions()
                .then(succeedCall(APIRequestType.RequestTrainings, dispatch))
                .catch(console.error);
        };
    }

    public static requestSectors() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.getSectorSuggestions()
                .then(succeedCall(APIRequestType.RequestSectors, dispatch))
                .catch(console.error);
        };
    }

    public static requestKeySkills() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.getKeySkillSuggestions()
                .then(succeedCall(APIRequestType.RequestKeySkills, dispatch))
                .catch(console.error);
        };
    }

    public static requestCareers() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.getCareerSuggestions()
                .then(succeedCall(APIRequestType.RequestCareers, dispatch))
                .catch(console.error);
        };
    }

    public static requestProjectRoles() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.getProjectRoleSuggestions()
                .then(succeedCall(APIRequestType.RequestProjectRoles, dispatch))
                .catch(console.error);
        };
    }

    public static requestCompanies() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.getCompanySuggestions()
                .then(succeedCall(APIRequestType.RequestCompanies, dispatch))
                .catch(console.error);
        };
    }

    public static getAllCurrentlyUsedSkills() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            profileServiceClient.getSkillSuggestions()
                .then(succeedCall(APIRequestType.RequestSkillNames, dispatch))
                .catch(console.error);
        };
    }

    public static logInUser(initials: string, navTarget?: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            if (!initials || initials.length <= 0) {
                dispatch(ProfileActionCreator.FailLogin());
            } else {
                ConsultantClient.instance().getConsultant(initials).then(consultant => {
                    dispatch(consultantUpdateAction(consultant));
                    dispatch(ProfileDataAsyncActionCreator.loadFullProfile(initials));

                    dispatch(StatisticsActionCreator.AsyncGetProfileStatistics(initials));
                    dispatch(StatisticsActionCreator.AsyncCheckAvailability());
                    dispatch(ViewProfileActionCreator.AsyncLoadAllViewProfiles());
                    dispatch(TemplateActionCreator.AsyncLoadAllTemplates());
                    window.localStorage.setItem(COOKIE_INITIALS_NAME, initials);
                    if (!isNullOrUndefined(navTarget)) {
                        dispatch(NavigationActionCreator.AsyncNavigateTo(navTarget));
                    }
                }).catch(error => {
                    dispatch(ProfileActionCreator.FailLogin());
                    dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.USER_SPECIAL_LOGOUT));
                });
            }

        };
    }


}
