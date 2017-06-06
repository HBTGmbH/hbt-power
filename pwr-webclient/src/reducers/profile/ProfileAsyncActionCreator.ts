import * as redux from 'redux';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {
    deleteViewProfileString,
    getAllViewProfilesString,
    getCompanySuggestionsAPIString,
    getEducationSuggestionAPIString,
    getLangSuggestionAPIString, getPostSortViewAPIString, getPostViewProfileAPIString,
    getProfileAPIString,
    getProjectRolesSuggestionAPIString,
    getQualificationSuggestionAPIString,
    getSectorsSuggestionAPIString,
    getTrainingSuggestionAPIString, getViewProfileString
} from '../../API_CONFIG';
import {APIProfile} from '../../model/APIProfile';
import {InternalDatabase} from '../../model/InternalDatabase';
import {AllConsultantsState, APIRequestType, ProfileElementType} from '../../Store';
import {ProfileActionCreator} from './ProfileActionCreator';
import {ActionType} from '../ActionType';
import {ActionCreator} from 'react-redux';
import {NameEntityUtil} from '../../utils/NameEntityUtil';
import {ViewProfile} from '../../model/viewprofile/ViewProfile';
import {ViewElement} from '../../model/viewprofile/ViewElement';

export class ProfileAsyncActionCreator {

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
                ProfileAsyncActionCreator.logAxiosError(error);
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
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    private static abstractAPISuggestionRequest(dispatch: redux.Dispatch<AllConsultantsState>, apiString: string, type:APIRequestType) {
        dispatch(ProfileActionCreator.APIRequestPending());
        axios.get(apiString).then(function(response: AxiosResponse) {
            dispatch(ProfileActionCreator.APIRequestSuccessfull(response.data, type));
        }).catch(function(error:any) {
            ProfileAsyncActionCreator.logAxiosError(error);
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

    public static editProfile(initials: string) {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            dispatch({
                type: ActionType.ShowProfile
            });
            dispatch(ProfileAsyncActionCreator.requestSingleProfile(initials));
        }
    }

    public static logInUser(initials: string) {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            axios.get(getProfileAPIString(initials)).then(function(response: AxiosResponse) {
                let profile: APIProfile = Object.assign({}, response.data);
                // Parse the dates.
                dispatch(ProfileActionCreator.APIRequestSuccessfull(profile, APIRequestType.RequestProfile));
                dispatch({
                    type: ActionType.LogInUser,
                    initials: initials
                });
                dispatch(ProfileAsyncActionCreator.getAllViewProfiles(initials));
            }).catch(function(error:any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.FailLogin());
            });
        }
    }

    public static createView(initials: string, name: string, description: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            let config: AxiosRequestConfig = {
                params: {
                    name: name,
                    description: description
                }
            };
            axios.post(getPostViewProfileAPIString(initials), null, config).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.ReceiveAPIViewProfile(response.data));
            }).catch(function(error:any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    public static getViewProfile(id: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.get(getViewProfileString(id)).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.ReceiveAPIViewProfile(response.data))
            }).catch(function(error:any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    public static deleteViewProfile(id: string, initials: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.delete(deleteViewProfileString(id, initials)).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.DeleteViewProfile(id));
                dispatch(ProfileActionCreator.SucceedAPIRequest());
            }).catch(function(error:any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    public static getAllViewProfiles(initials: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.get(getAllViewProfilesString(initials)).then(function(response: AxiosResponse) {
                let ids: Array<string> = response.data;
                ids.forEach(id => {
                    dispatch(ProfileAsyncActionCreator.getViewProfile(id))
                });
                dispatch(ProfileActionCreator.SucceedAPIRequest());
            }).catch(function(error:any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    public static sortView(elementType: ProfileElementType,
                           entryField: 'DATE' | 'DATE_START' | 'DATE_END' | 'NAME' | 'LEVEL' | 'DEGREE',
                           naturalSortOrder: 'ASC' | 'DESC',
                           viewProfileId: string
                        ) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            let config: AxiosRequestConfig = {
                params: {
                    action: "sort",
                    entry: NameEntityUtil.typeToViewAPIString(elementType),
                    order: naturalSortOrder,
                    field: entryField
                }
            };
            axios.post(getPostSortViewAPIString(viewProfileId), [], config).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.ReceiveAPIViewProfile(response.data));
            }).catch(function(error:any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    public static filterView(elementType: ProfileElementType,
                             viewProfileId: string,
                             selectedIndexes: Array<number> | string,
                             lookup: Immutable.List<ViewElement>
    ) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            let indexes: Array<number> = [];
            if(selectedIndexes == 'all') {
                indexes = lookup.map((ve, key) => key).toArray();
            } else if(selectedIndexes == 'none') {
                indexes = [];
            } else {
                indexes = selectedIndexes as Array<number>;
            }
            let config: AxiosRequestConfig = {
                params: {
                    action: "filter",
                    entry: NameEntityUtil.typeToViewAPIString(elementType),
                },
                headers: {
                    "Content-Type":"application/json"
                }
            };
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.post(getPostSortViewAPIString(viewProfileId), JSON.stringify(indexes), config).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.ReceiveAPIViewProfile(response.data));
            }).catch(function(error:any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

}