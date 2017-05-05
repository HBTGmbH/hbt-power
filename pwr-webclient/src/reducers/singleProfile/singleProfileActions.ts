/**
 * @author nt | nt@hbt.de
 */

import {AllConsultantsState, APIRequestType, ProfileElementType} from '../../Store';
import {AbstractAction, ActionType} from '../reducerIndex';
import * as redux from 'redux';
import axios, {AxiosResponse} from 'axios';
import {
    getEducationSuggestionAPIString,
    getLangSuggestionAPIString,
    getProfileAPIString,
    getQualificationSuggestionAPIString,
    getSectorsSuggestionAPIString,
    getTrainingSuggestionAPIString
} from '../../API_CONFIG';
import {APIProfile} from '../../model/APIProfile';
import {InternalDatabase} from '../../model/InternalDatabase';
import {NameEntity} from '../../model/NameEntity';


export interface ChangeStringValueAction extends AbstractAction {
    /**
     * The new abstract text.
     */
    value: string;
}


export interface ReceiveAPIResponseAction extends AbstractAction {
    requestType: APIRequestType;
    payload: any;
}


export interface CreateEntryAction extends  AbstractAction {
    entryType: ProfileElementType;
}

/**
 * Action used to represent the removal of an entry in the profile. The entry that is removed
 * is defined by the elementType and by their id.
 */
export interface DeleteEntryAction extends AbstractAction {
    elementType: ProfileElementType;
    elementId: string;
}

export interface SaveEntryAction extends AbstractAction {
    entryType: ProfileElementType;
    entry: any;
    nameEntity: NameEntity;
}

export class ProfileActionCreator {
    public static changeAbstract(newAbstract: string): ChangeStringValueAction {
        return {
            type: ActionType.ChangeAbstract,
            value: newAbstract
        };
    }

    /**
     * Creates an action that updates the state so that its profile request status is pending.
     * @returns {{type: ActionType}}
     */
    public static APIRequestPending() : AbstractAction {
        return {
            type: ActionType.APIRequestPending
        };
    }

    /**
     * Creates an action that update the state so the received consultant profile is used to replace
     * the current profile.
     * @param payload
     * @param reqType
     */
    public static APIRequestSuccessfull(payload: any, reqType: APIRequestType) : ReceiveAPIResponseAction {
        return {
            type: ActionType.APIRequestSuccess,
            payload: payload,
            requestType: reqType
        };
    }

    public static APIRequestFailed() : AbstractAction {
        return { type: ActionType.APIRequestFail };
    }

    public static deleteEntry(id: string, elementType: ProfileElementType): DeleteEntryAction {
        return {
            type: ActionType.DeleteEntry,
            elementType: elementType,
            elementId: id
        };
    }

    public static createEntry(elementType: ProfileElementType): CreateEntryAction {
        return {
            type: ActionType.CreateEntry,
            entryType: elementType
        }
    }

    public static saveEntry(entry: any, nameEntity: NameEntity, elementType: ProfileElementType): SaveEntryAction {
        return {
            type: ActionType.SaveEntry,
            entry: entry,
            nameEntity: nameEntity,
            entryType: elementType
        }
    }
}


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

    public static requestLanguages() {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.get(getLangSuggestionAPIString()).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.APIRequestSuccessfull(response.data, APIRequestType.RequestLanguages));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    public static requestEducations() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.get(getEducationSuggestionAPIString()).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.APIRequestSuccessfull(response.data, APIRequestType.RequestEducations));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    public static requestQualifications() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.get(getQualificationSuggestionAPIString()).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.APIRequestSuccessfull(response.data, APIRequestType.RequestQualifications));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    public static requestCareers() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.get(getTrainingSuggestionAPIString()).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.APIRequestSuccessfull(response.data, APIRequestType.RequestCareers));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }

    public static requestSectors() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.get(getSectorsSuggestionAPIString()).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.APIRequestSuccessfull(response.data, APIRequestType.RequestSectors));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        };
    }
/*
    private static performAbstractSaveEntryAction(
        address: string,
        entry: any,
        dispatch: redux.Dispatch<InternalDatabase>,
        requestType: APIRequestType)
    {
        dispatch(ProfileActionCreator.APIRequestPending());
        axios.post(address, entry).then(function(response: AxiosResponse) {
            dispatch(ProfileActionCreator.APIRequestSuccessfull(response.data, requestType));
        }).catch(function(error:any){
            console.error(error);
            dispatch(ProfileActionCreator.APIRequestFailed());
        });
    }

    **
     * Fixme comment
     * @param initials
     * @param trainingEntry
     * @returns {(dispatch:redux.Dispatch<InternalDatabase>)=>undefined}
     *
    public static saveCareerElement(initials: string, trainingEntry: TrainingEntry, careers: Immutable.Map<number, Training>) {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            let apiCareerElement: APICareerElement = trainingEntry.toAPICareer(careers);
            ProfileAsyncActionCreator.performAbstractSaveEntryAction(
                getSaveCareerElementAPIString(initials),
                apiCareerElement,
                dispatch,
                APIRequestType.SaveCareerElement);
        };
    }

    **
     * Creates an asynchronous action that saves a single sector entry.
     *
     * This invokes a PUT request to the API defined in the API_CONFIG.ts. This operation can be assumed persistent.
     *
     * In order to resolve the {@link SectorEntry.sectorId} correctly, the map of all
     * {@link Sector} elements currently known to the server is needed.This is necessary because the API
     * expects a nested object, whereas this client stores all information normalized, without nested entities.
     *
     * @param initials of the consultant whose profile is updates with the new sector entry
     * @param sectorEntry is the sector entry that is added to the profile
     * @param sectorEntries is the immutable map of all possible sectorEntries
     * @returns {(dispatch:redux.Dispatch<InternalDatabase>)=>undefined}
     *
    public static saveSectorEntry(initials:string, sectorEntry: SectorEntry, sectorEntries: Immutable.Map<number, Sector>) {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            let apiSectorEntry: APISectorEntry = sectorEntry.toAPISectorEntry(sectorEntries);
            ProfileAsyncActionCreator.performAbstractSaveEntryAction(
                getSaveSectorEntryAPIString(initials),
                apiSectorEntry,
                dispatch,
                APIRequestType.SaveSectorEntry);
        };
    }

    **
     * Creates an asynchronous action that saves a single language skill to a profile.
     *
     * This invokes a PUT request to the API defined in the API_CONFIG.ts. This operation can be assumed persistent.
     *
     * In order to resolve the {@link LanguageSkill.languageId} correctly, the map of all
     * {@link Language} elements currently known to the server is needed.This is necessary because the API
     * expects a nested object, whereas this client stores all information normalized, without nested entities.
     *
     * @param initials of the consultant whose profile is updates with the new sector entry
     * @param languageSkill is the {@link LanguageSkill} that is added to the profile.
     * @param languages is the immutable map of all possible {@link Language}s
     * @returns {(dispatch:redux.Dispatch<InternalDatabase>)=>undefined}
     *
    public static saveLanguageSkill(initials: string, languageSkill: LanguageSkill, languages: Immutable.Map<number, Language>){
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            let apiLanguageSkill: APILanguageSkill = languageSkill.toAPILanguageSkill(languages);
            ProfileAsyncActionCreator.performAbstractSaveEntryAction(
                getSaveLangaugeSkillAPIString(initials),
                apiLanguageSkill,
                dispatch,
                APIRequestType.SaveLanguageSkill);
        };
    }

    **
     * Creates an asynchronous action that saves a single {@link EducationEntry} to a profile.
     * @param initials are the initials of the consultant whose profile is updated.
     * @param educationEntry is the {@link EducationEntry} that is added to the profile
     * @param educations
     * @returns {(dispatch:redux.Dispatch<InternalDatabase>)=>undefined}
     *
    public static saveEducationEntry(initials: string, educationEntry: EducationEntry, educations: Immutable.Map<number, Education>) {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            let apiEducationEntry: APIEducationStep = educationEntry.toAPIEducationEntry(educations);
            ProfileAsyncActionCreator.performAbstractSaveEntryAction(
                getSaveEducationEntryAPIString(initials),
                apiEducationEntry,
                dispatch,
                APIRequestType.SaveEducationStep);
        };
    }

    public static saveQualificationEntry(initials: string, qualificationEntry: QualificationEntry, qualifications: Immutable.Map<number, Qualification>) {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            let apiQualificationEntry: APIQualificationEntry = qualificationEntry.toAPIQualificationEntry(qualifications);
            ProfileAsyncActionCreator.performAbstractSaveEntryAction(
                getSaveQualificationEntryAPIString(initials),
                apiQualificationEntry,
                dispatch,
                APIRequestType.SaveQualificationEntry);
        };
    }*/
}