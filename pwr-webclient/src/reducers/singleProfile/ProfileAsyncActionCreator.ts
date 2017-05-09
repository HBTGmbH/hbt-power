import * as redux from 'redux';
import axios, {AxiosResponse} from 'axios';
import {
    getCompanySuggestionsAPIString,
    getEducationSuggestionAPIString,
    getLangSuggestionAPIString,
    getProfileAPIString, getProjectRolesSuggestionAPIString,
    getQualificationSuggestionAPIString,
    getSectorsSuggestionAPIString,
    getTrainingSuggestionAPIString
} from '../../API_CONFIG';
import {APIProfile} from '../../model/APIProfile';
import {InternalDatabase} from '../../model/InternalDatabase';
import {AllConsultantsState, APIRequestType} from '../../Store';
import {ProfileActionCreator} from './ProfileActionCreator';

export class ProfileAsyncActionCreator {

    /**
     *
     * @param initials
     * @returns {(dispatch:redux.Dispatch<AllConsultantsState>)=>undefined}
     */
    public static requestSingleProfile(initials: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            // Dispatch the action that sets the status to "Request Pendign" or similar
            dispatch(ProfileActionCreator.APIRequestPending());
            // Perform the actual request
            axios.get(getProfileAPIString(initials)).then(function(response: AxiosResponse) {
                let profile: APIProfile = Object.assign({}, response.data);
                // Parse the dates.
                dispatch(ProfileActionCreator.APIRequestSuccessfull(profile, APIRequestType.RequestProfile));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });

        };
    }

    public static saveFullProfile(initials: string, profile: APIProfile) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.put(getProfileAPIString(initials), profile).then(function(response: AxiosResponse) {
                console.info("Notifications: ", response.data.notifications);
                dispatch(ProfileActionCreator.APIRequestSuccessfull(response.data, APIRequestType.SaveProfile));
            }).catch(function(error:any) {
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
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    private static abstractAPISuggestionRequest(dispatch: redux.Dispatch<AllConsultantsState>, apiString: string, type:APIRequestType) {
        dispatch(ProfileActionCreator.APIRequestPending());
        axios.get(apiString).then(function(response: AxiosResponse) {
            dispatch(ProfileActionCreator.APIRequestSuccessfull(response.data, type));
        }).catch(function(error:any) {
            console.error(error);
            dispatch(ProfileActionCreator.APIRequestFailed());
        });
    }

    public static requestLanguages() {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            ProfileAsyncActionCreator.abstractAPISuggestionRequest(dispatch, getLangSuggestionAPIString(), APIRequestType.RequestLanguages);
        };
    }

    public static requestEducations() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            ProfileAsyncActionCreator.abstractAPISuggestionRequest(
                dispatch,
                getEducationSuggestionAPIString(),
                APIRequestType.RequestEducations);
        };
    }

    public static requestQualifications() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            ProfileAsyncActionCreator.abstractAPISuggestionRequest(
                dispatch,
                getQualificationSuggestionAPIString(),
                APIRequestType.RequestQualifications);
        };
    }

    public static requestCareers() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            ProfileAsyncActionCreator.abstractAPISuggestionRequest(
                dispatch,
                getTrainingSuggestionAPIString(),
                APIRequestType.RequestCareers);
        };
    }

    public static requestSectors() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            ProfileAsyncActionCreator.abstractAPISuggestionRequest(
                dispatch,
                getSectorsSuggestionAPIString(),
                APIRequestType.RequestSectors);
        };
    }

    public static requestProjectRoles() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            ProfileAsyncActionCreator.abstractAPISuggestionRequest(
                dispatch,
                getProjectRolesSuggestionAPIString(),
                APIRequestType.RequestProjectRoles);
        };
    }

    public static requestCompanies() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            ProfileAsyncActionCreator.abstractAPISuggestionRequest(
                dispatch,
                getCompanySuggestionsAPIString(),
                APIRequestType.RequestCompanies);
        };
    }

}