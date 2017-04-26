/**
 * @author nt | nt@hbt.de
 */

import {AllConsultantsState, APIRequestType, DateFieldType, ProfileElementType} from '../../Store';
import {AbstractAction, ActionType} from '../reducerIndex';
import * as redux from 'redux';
import axios, {AxiosResponse} from 'axios';
import {
    getCareerSuggestionAPIString,
    getEducationSuggestionAPIString, getLangSuggestionAPIString, getProfileAPIString,
    getQualificationSuggestionAPIString, getSectorsSuggestionAPIString
} from '../../API_CONFIG';
import {APIProfile} from '../../model/APIProfile';
import {InternalDatabase} from '../../model/InternalDatabase';

/**
 * Actions that invokes modification of the abstract.
 * The abstract is the text that is associated with a single profile.
 */
export interface ChangeAbstractAction extends AbstractAction {
    /**
     * The new abstract text.
     */
    newAbstract: string;
}

/**
 * Action that changes the language ID of the given language skill.
 */
export interface ChangeLanguageSkillNameAction extends AbstractAction {
    /**
     * The ID of the language that is assigned to the language skill.
     */
    newLanguageId: number;
    /**
     * The ID of the language skill that is being modified.
     */
    languageSkillId: number;
}

/**
 * Changes the language level of the language skill associated with the given ID.
 */
export interface ChangeLanguageSkillLevelAction extends AbstractAction {
    /**
     * {@link Language.id} of the language that is supposed to be modified.
     * the ID is not existent, nothing will happen.
     */
    languageSkillId: number;

    /**
     * The new language level. May be an arbitary string. Note that the API performs consistency checks.
     */
    newLanguageLevel: string;
}


export interface ReceiveAPIResponseAction extends AbstractAction {
    requestType: APIRequestType;
    payload: any;
}

/**
 * Action that invokes a date change on one of the available date fields in various classes.
 * <p>
 *     The field which is changed is defined by the {@link ChangeDateAction.targetField} type.
 *     This allows a more flexible use of a single action for multiple field, moving the logic from the 'dumb'
 *     action creator to the more 'smart' reducer.
 */
export interface ChangeDateAction extends AbstractAction {
    /**
     * New date. May be null or undefined for some target fields. The reducer accepting this action
     * will perform the logic.
     */
   newDate: Date;

    /**
     *  Field that is the target of the date field. The reducer decides which fields gets modified.
     */
   targetField: DateFieldType;

    /**
     * Id of the target field.
     */
   targetFieldId: number;
}

export interface ChangeItemIdAction extends AbstractAction {
    /**
     * The type that is changed.
     */
    elementType: ProfileElementType;
    /**
     * The id that is given to the entry.
     */
    newItemId: number;
    /**
     * The entry that is changed
     */
    entryId: number;
}

/**
 * Action used to represent the removal of an entry in the profile. The entry that is removed
 * is defined by the elementType and by their id.
 */
export interface RemoveEntryAction extends AbstractAction {
    elementType: ProfileElementType;
    elementId: number;
}

export class ProfileActionCreator {
    public static changeAbstract(newAbstract: string): ChangeAbstractAction {
        return {
            type: ActionType.ChangeAbstract,
            newAbstract: newAbstract
        }
    }

    public static changeLanguageSkillLevel(newLevel: string, langSkillId: number):ChangeLanguageSkillLevelAction {
        return {
            type: ActionType.ChangeLanguageSkillLevel,
            newLanguageLevel: newLevel,
            languageSkillId: langSkillId
        }
    }

    /**
     * Creates an action that updates the state so that its profile request status is pending.
     * @returns {{type: ActionType}}
     */
    public static APIRequestPending() : AbstractAction {
        return {
            type: ActionType.APIRequestPending
        }
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
        }
    }

    public static APIRequestFailed() : AbstractAction {
        return { type: ActionType.APIRequestFail };
    }


    public static changeDateField(id: number, newDate: Date, targetField: DateFieldType): ChangeDateAction {
        return {
            type: ActionType.ChangeDate,
            newDate: newDate,
            targetField: targetField,
            targetFieldId: id
        }
    }

    public static changeItemId(newItemId: number, entryId: number, elementType: ProfileElementType): ChangeItemIdAction {
        return {
            type: ActionType.ChangeItemId,
            elementType: elementType,
            newItemId: newItemId,
            entryId: entryId
        }
    }

    public static removeEntry(id: number, elementType: ProfileElementType): RemoveEntryAction {
        return {
            type: ActionType.RemoveEntry,
            elementType: elementType,
            elementId: id
        }
    }
}


export class ProfileAsyncActionCreator {
    public static requestSingleProfile(initials: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            // Dispatch the action that sets the status to "Request Pendign" or similar
            dispatch(ProfileActionCreator.APIRequestPending());
            // Perform the actual request
            axios.get(getProfileAPIString(initials)).then(function(response: AxiosResponse) {
                let profile: APIProfile = Object.assign({}, response.data);
                //ProfileAsyncActionCreator.validate(profile);
                //ProfileAsyncActionCreator.parseInfos(profile);
                // Parse the dates.
                dispatch(ProfileActionCreator.APIRequestSuccessfull(profile, APIRequestType.RequestProfile));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });

        }
    }

    public static saveFullProfile(initials: string, profile: APIProfile) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.put(getProfileAPIString(initials), profile).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.APIRequestSuccessfull({}, APIRequestType.SaveProfile));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        }
    }

    public static requestLanguages() {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.get(getLangSuggestionAPIString()).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.APIRequestSuccessfull(response.data, APIRequestType.RequestLanguages));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            })
        }
    }

    public static requestEducations() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.get(getEducationSuggestionAPIString()).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.APIRequestSuccessfull(response.data, APIRequestType.RequestEducations));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            })
        }
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
        }
    }

    public static requestCareers() {
        return function(dispatch: redux.Dispatch<InternalDatabase>) {
            dispatch(ProfileActionCreator.APIRequestPending());
            axios.get(getCareerSuggestionAPIString()).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.APIRequestSuccessfull(response.data, APIRequestType.RequestCareers));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        }
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
        }
    }
}