import * as redux from 'redux';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {
    deleteViewProfileString,
    getAllViewProfilesString, getCareerSuggestionAPIString,
    getCompanySuggestionsAPIString,
    getConsultantApiString,
    getEducationSuggestionAPIString, getExportDocuments, getKeySkillsSuggestionAPIString,
    getLangSuggestionAPIString,
    GetPostMutateViewProfile,
    getPostViewProfileAPIString,
    getProfileAPIString,
    getProjectRolesSuggestionAPIString,
    getQualificationSuggestionAPIString,
    getSectorsSuggestionAPIString,
    getTrainingSuggestionAPIString,
    getViewProfileString, postCreatePDFProfile,
    postDuplicateViewProfile,
    postEditViewProfileDetails
} from '../../API_CONFIG';
import {APIProfile} from '../../model/APIProfile';
import {InternalDatabase} from '../../model/InternalDatabase';
import {AllConsultantsState, APIRequestType, ApplicationState, ProfileElementType} from '../../Store';
import {ProfileActionCreator} from './ProfileActionCreator';
import {ActionType} from '../ActionType';
import {NameEntityUtil} from '../../utils/NameEntityUtil';
import {ViewElement} from '../../model/viewprofile/ViewElement';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {StatisticsActionCreator} from '../statistics/StatisticsActionCreator';
import {APIExportDocument, ExportDocument} from '../../model/ExportDocument';
import {isNullOrUndefined} from 'util';

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


    public static requestAllNameEntities() {
        return function(dispatch: redux.Dispatch<ApplicationState>) {
            dispatch(ProfileAsyncActionCreator.requestQualifications());
            dispatch(ProfileAsyncActionCreator.requestLanguages());
            dispatch(ProfileAsyncActionCreator.requestEducations());
            dispatch(ProfileAsyncActionCreator.requestTrainings());
            dispatch(ProfileAsyncActionCreator.requestSectors());
            dispatch(ProfileAsyncActionCreator.requestCompanies());
            dispatch(ProfileAsyncActionCreator.requestProjectRoles());
            dispatch(ProfileAsyncActionCreator.requestKeySkills());
            dispatch(ProfileAsyncActionCreator.requestCareers());
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
                console.info('Notifications: ', response.data.notifications);
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

    public static requestTrainings() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            ProfileAsyncActionCreator.abstractAPISuggestionRequest(
                dispatch,
                getTrainingSuggestionAPIString(),
                APIRequestType.RequestTrainings);
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

    public static requestKeySkills() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            ProfileAsyncActionCreator.abstractAPISuggestionRequest(
                dispatch,
                getKeySkillsSuggestionAPIString(),
                APIRequestType.RequestKeySkills);
        };
    }


    public static requestCareers() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            ProfileAsyncActionCreator.abstractAPISuggestionRequest(
                dispatch,
                getCareerSuggestionAPIString(),
                APIRequestType.RequestCareers);
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
        };
    }

    public static logInUser(initials: string, disableRedirect?: boolean) {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            if(isNullOrUndefined(disableRedirect)) disableRedirect = false;
            axios.get(getConsultantApiString(initials)).then(function(response: AxiosResponse) {
                dispatch(ProfileAsyncActionCreator.requestSingleProfile(initials));
                dispatch({
                    type: ActionType.LogInUser,
                    consultantInfo: ConsultantInfo.fromAPI(response.data),
                    disableRedirect: disableRedirect
                });
                dispatch(ProfileAsyncActionCreator.getAllViewProfiles(initials));
                dispatch(ProfileAsyncActionCreator.requestAllNameEntities());
                dispatch(StatisticsActionCreator.AsyncGetProfileStatistics(initials));
                dispatch(StatisticsActionCreator.AsyncCheckAvailability());
            }).catch(function(error:any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.FailLogin());
            });
        };
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
                dispatch(ProfileActionCreator.ReceiveAPIViewProfile(response.data));
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
            dispatch(ProfileActionCreator.ClearViewProfiles());
            axios.get(getAllViewProfilesString(initials)).then(function(response: AxiosResponse) {
                let ids: Array<string> = response.data;
                ids.forEach(id => {
                    dispatch(ProfileAsyncActionCreator.getViewProfile(id));
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
                    action: 'sort',
                    entry: NameEntityUtil.typeToViewAPIString(elementType),
                    order: naturalSortOrder,
                    field: entryField
                }
            };
            axios.post(GetPostMutateViewProfile(viewProfileId), [], config).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.ReceiveAPIViewProfile(response.data));
            }).catch(function(error:any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    public static filterViewElements(elementType: ProfileElementType,
                             viewProfileId: string,
                             index: number,
                             enabled: boolean,
                             lookup: Immutable.List<ViewElement>
    ) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            let currentIndexes: Set<number> = new Set<number>();
            lookup.forEach((value, key, iter) => {
                if(value.enabled()) currentIndexes.add(key);
            });
            if(enabled)
                currentIndexes.add(index);
            else
                currentIndexes.delete(index);
            let config: AxiosRequestConfig = {
                params: {
                    action: 'filter',
                    entry: NameEntityUtil.typeToViewAPIString(elementType),
                },
                headers: {
                    'Content-Type':'application/json'
                }
            };
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.post(GetPostMutateViewProfile(viewProfileId), Array.from(currentIndexes.values()), config).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.ReceiveAPIViewProfile(response.data));
            }).catch(function(error:any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    public static swapViewElements(elementType: ProfileElementType, viewProfileId: string, index1: number, index2: number) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            let indexes: Array<number> = [index1, index2];
            let config: AxiosRequestConfig = {
                params: {
                    action: 'swap',
                    entry: NameEntityUtil.typeToViewAPIString(elementType),
                },
                headers: {
                    'Content-Type':'application/json'
                }
            };
            dispatch(ProfileActionCreator.SwapIndexes(elementType, viewProfileId, index1, index2));
            axios.post(GetPostMutateViewProfile(viewProfileId), JSON.stringify(indexes), config).then(function(response: AxiosResponse) {
                //dispatch(ProfileActionCreator.ReceiveAPIViewProfile(response.data));
            }).catch(function(error:any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    public static editViewProfileDetails(viewProfileId: string, name: string, description: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            axios.post(postEditViewProfileDetails(viewProfileId), {
                name: name,
                description: description
            }).then(function (response: AxiosResponse) {
                dispatch(ProfileActionCreator.ReceiveAPIViewProfile(response.data));
            }).catch(function (error: any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    /**
     * Invokes duplication of a view profile by the API backend and parses the response as view profile, which is
     * then added to the list of available view profiles.
     * @param viewProfileId
     * @returns {(dispatch:redux.Dispatch<AllConsultantsState>)=>undefined}
     */
    public static duplicateViewProfile(viewProfileId: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            axios.post(postDuplicateViewProfile(viewProfileId)).then(function (response: AxiosResponse) {
                dispatch(ProfileActionCreator.ReceiveAPIViewProfile(response.data));
            }).catch(function (error: any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    public static generatePDFProfile(initials: string, viewProfileId: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            let config: AxiosRequestConfig = {
                params: {
                    viewid: viewProfileId
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            axios.post(postCreatePDFProfile(initials), null, config).then((response: AxiosResponse) => {
                let location = response.data.filelocation;
                window.open(location, "_blank");
            }).catch(function (error: any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        }
    }

    public static getAllExportDocuments(initials: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            axios.get(getExportDocuments(initials)).then((response: AxiosResponse) => {
                let apiExportDocs: Array<APIExportDocument> = response.data;
                let exportDocs = apiExportDocs.map(value => ExportDocument.fromAPI(value));
                dispatch(ProfileActionCreator.APIRequestSuccessfull(exportDocs, APIRequestType.RequestExportDocs));
            }).catch(function (error: any) {
                ProfileAsyncActionCreator.logAxiosError(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        }
    }
}