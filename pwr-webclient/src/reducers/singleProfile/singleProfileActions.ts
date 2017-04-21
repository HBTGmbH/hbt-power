/**
 * Created by nt on 20.04.2017.
 */

import {AllConsultantsState} from '../../Store';
import {AbstractAction, ActionType} from '../reducerIndex';
import * as redux from 'redux';
import axios, {AxiosResponse} from 'axios';
import {getProfileAPIString} from '../../API_CONFIG';
import {Profile} from '../../model/Profile';

export interface ChangeAbstractAction extends AbstractAction {
    newAbstract: string;
}

export interface ChangeLanguageSkillNameAction extends AbstractAction {
    newName: string;
    index: number;
}

export interface ChangeLanguageSkillLevelAction extends AbstractAction {
    newLevel: string;
    index: number;
}


export interface ReceiveFullProfileAction extends AbstractAction {
    profile: Profile;
}

export class ProfileActionCreator {
    public static changeLanguageSkillName(newName: string, index: number) : ChangeLanguageSkillNameAction {
        return {
            type: ActionType.ChangeLanguageSkillName,
            newName : newName,
            index: index
        }
    }

    public static changeLanguageSkillLevel(newLevel: string, index: number):ChangeLanguageSkillLevelAction {
        return {
            type: ActionType.ChangeLanguageSkillLevel,
            newLevel: newLevel,
            index: index
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
    public static receiveFullProfile(profile: Profile) : ReceiveFullProfileAction {
        return {
            type: ActionType.ReceiveFullProfile,
            profile: profile
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
    private static parseInfos(profile: Profile) {
        // Very bad hacking.
        profile.education.forEach(e => e.date = new Date(e.date));
        profile.qualification.forEach(q => q.date = new Date(q.date));
        profile.career.forEach(e => {e.startDate = new Date(e.startDate); e.endDate = new Date(e.endDate)});

    }

    public static requestSingleProfile(initials: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            // Dispatch the action that sets the status to "Request Pendign" or similar
            dispatch(ProfileActionCreator.requestingFullProfile());
            // Perform the actual request
            axios.get(getProfileAPIString(initials)).then(function(response: AxiosResponse) {
                let profile: Profile = Object.assign({}, response.data);
                console.info("Received profile during API request:", profile);
                ProfileAsyncActionCreator.parseInfos(profile);
                // Parse the dates.
                dispatch(ProfileActionCreator.receiveFullProfile(profile));
            }).catch(function(error:any) {
                console.error(error);
                dispatch(ProfileActionCreator.failRequestFullProfile())
            });

        }
    }

    public static saveFullProfile(initials: string, profile: Profile) {
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