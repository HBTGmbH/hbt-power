/**
 * Created by nt on 20.04.2017.
 */

import {AllConsultantsState} from '../../Store';
import {AbstractAction, ActionType} from '../reducerIndex';
import * as redux from 'redux';
import axios, {AxiosResponse} from 'axios';
import {getProfileAPIString} from '../../API_CONFIG';
import {isNull, isNullOrUndefined} from 'util';
import {APIProfile} from '../../model/APIProfile';

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


export interface ReceiveFullProfileAction extends AbstractAction {
    apiProfile: APIProfile;
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
    public static requestingFullProfile() : AbstractAction {
        return {
            type: ActionType.RequestingFullProfile
        }
    }

    /**
     * Creates an action that update the state so the received consultant profile is used to replace
     * the current profile.
     * @param profile
     */
    public static receiveFullProfile(profile: APIProfile) : ReceiveFullProfileAction {
        return {
            type: ActionType.ReceiveFullProfile,
            apiProfile: profile
        }
    }

    public static failRequestFullProfile() : AbstractAction {
        return { type: ActionType.FailRequestFullProfile };
    }

    public static saveFullProfile(): AbstractAction {
        return {
            type: ActionType.SaveFullProfile
        }
    }

    public static saveFullProfileSuccessful() : AbstractAction {
        return {
            type: ActionType.SaveFullProfilSuccess
        }
    }

    public static saveFullProfileFail() : AbstractAction {
        return {
            type: ActionType.SaveFullProfileFail
        }
    }



}


export class ProfileAsyncActionCreator {
    /*private static parseInfos(profile: Profile) {
        // Very bad hacking.
        profile.education.forEach(e => e.date = new Date(e.date));
        profile.qualification.forEach(q => q.date = new Date(q.date));
        profile.career.forEach(e => {e.startDate = new Date(e.startDate); e.endDate = new Date(e.endDate)});

    }

    private static validate(profile: Profile) {
        if(isNullOrUndefined(profile.languages)) throw new Error("Languages may not be null or undefined.");
        if(isNullOrUndefined(profile.qualification)) throw new Error("qualification may not be null or undefined.");
        if(isNullOrUndefined(profile.description)) throw new Error("description may not be null or undefined.");
        if(isNullOrUndefined(profile.currentPosition)) throw new Error("currentPosition may not be null or undefined.");
        if(isNullOrUndefined(profile.career)) throw new Error("career may not be null or undefined.");
        if(isNullOrUndefined(profile.education)) throw new Error("education may not be null or undefined.");
        if(isNullOrUndefined(profile.sectors)) throw new Error("sectors may not be null or undefined.");
    }*/

    public static requestSingleProfile(initials: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            // Dispatch the action that sets the status to "Request Pendign" or similar
            dispatch(ProfileActionCreator.requestingFullProfile());
            // Perform the actual request
            axios.get(getProfileAPIString(initials)).then(function(response: AxiosResponse) {
                let profile: APIProfile = Object.assign({}, response.data);
                console.info("Received profile during API request:", profile);
                //ProfileAsyncActionCreator.validate(profile);
                //ProfileAsyncActionCreator.parseInfos(profile);
                // Parse the dates.
                dispatch(ProfileActionCreator.receiveFullProfile(profile));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.failRequestFullProfile())
            });

        }
    }

    public static saveFullProfile(initials: string, profile: APIProfile) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            dispatch(ProfileActionCreator.saveFullProfile());
            axios.put(getProfileAPIString(initials), profile).then(function(response: AxiosResponse) {
                dispatch(ProfileActionCreator.saveFullProfileSuccessful());
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.saveFullProfileFail());
            });
        }
    }
}