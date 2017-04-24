/**
 * Created by nt on 20.04.2017.
 */

import {AllConsultantsState, APIRequestType} from '../../Store';
import {AbstractAction, ActionType} from '../reducerIndex';
import * as redux from 'redux';
import axios, {AxiosResponse} from 'axios';
import {getLangSuggestionAPIString, getProfileAPIString} from '../../API_CONFIG';
import {isNull, isNullOrUndefined} from 'util';
import {APILanguageSkill, APIProfile} from '../../model/APIProfile';

export interface ChangeAbstractAction extends AbstractAction {
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
    languageSkillId: number;
    newLanguageLevel: string;
}


export interface ReceiveAPIResponseAction extends AbstractAction {
    requestType: APIRequestType;
    payload: any;
}

export class ProfileActionCreator {
    public static changeAbstract(newAbstract: string): ChangeAbstractAction {
        return {
            type: ActionType.ChangeAbstract,
            newAbstract: newAbstract
        }
    }

    /**
     * Creates an action that invokes a change of language that is associated with the given language skill.
     * @param newLangId
     * @param langSkilLId
     * @returns ChangeLanguageSkillNameAction
     */
    public static changeLanguageSkillName(newLangId: number, langSkillId: number) : ChangeLanguageSkillNameAction {
        return {
            type: ActionType.ChangeLanguageSkillName,
            newLanguageId: newLangId,
            languageSkillId: langSkillId
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
     * @param profile
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
}