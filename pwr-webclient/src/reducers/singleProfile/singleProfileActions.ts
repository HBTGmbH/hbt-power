/**
 * Created by nt on 20.04.2017.
 */

import {
    AllConsultantsState, ConsultantProfile, LanguageLevel, LanguageSkill, RequestStatus,
    SingleProfile
} from '../../Store';
import {AbstractAction, ActionType} from '../reducerIndex';
import * as redux from 'redux';
import axios, {AxiosResponse} from 'axios';
import {getProfileAPIString} from '../../API_CONFIG';
import {LanguageLevelUtil} from '../../utils/LanguageLevelUtil';

export interface ChangeAbstractAction extends AbstractAction {
    newAbstract: string;
}

export interface ChangeLanguageSkillAction extends AbstractAction {
    languageSkill: LanguageSkill;
    index: number;
}

export interface ReceiveFullProfileAction extends AbstractAction {
    profile: ConsultantProfile;
}

export class ProfileActionCreator {
    public static changeLanguageSkill(lang: LanguageSkill, index: number) : ChangeLanguageSkillAction {
        return {
            type: ActionType.ChangeLanguageSkill,
            languageSkill: lang,
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
    public static receiveFullProfile(profile: ConsultantProfile) : ReceiveFullProfileAction {
        return {
            type: ActionType.ReceiveFullProfile,
            profile: profile
        }
    }

    public static failRequestFullProfile() : AbstractAction {
        return { type: ActionType.FailRequestFullProfile };
    }


}


export class ProfileAsyncActionCreator {
    private static parseInfos(profile: ConsultantProfile) {
        profile.education.forEach(e => e.date = new Date(e.date));
        profile.qualifications.forEach(e => e.date = new Date(e.date));
        profile.career.forEach(e => {e.startDate = new Date(e.startDate); e.endDate = new Date(e.endDate)});
        // Very very bad hacking, but there is no other way to parse it as an enum
        // The input from the API will be a string, therefor, during runtime, e.languageLevel will be a string
        // But to typescript, it is a language level. Thats why we treat e.languageLevel in the FromString method
        // as a string...
        profile.languages.forEach(e => {e.languageLevel = LanguageLevelUtil.fromString(e.languageLevel)});

    }

    public static requestSingleProfile(initials: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            // Dispatch the action that sets the status to "Request Pendign" or similar
            dispatch(ProfileActionCreator.requestingFullProfile());
            // Perform the actual request
            axios.get(getProfileAPIString(initials)).then(function(response: AxiosResponse) {
                let profile: ConsultantProfile = Object.assign({}, response.data);

                ProfileAsyncActionCreator.parseInfos(profile);
                console.log("Profile:", profile);
                // Parse the dates.
                dispatch(ProfileActionCreator.receiveFullProfile(profile));
            }).catch(function(error:any) {
                dispatch(ProfileActionCreator.failRequestFullProfile())
            });

        }
    }
}