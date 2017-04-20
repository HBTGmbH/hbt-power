/**
 * Created by nt on 20.04.2017.
 */

import {
    AllConsultantsState, ConsultantProfile, LanguageLevel, LanguageSkill, RequestStatus,
    SingleProfile
} from '../../Store';
import {AbstractAction, ActionType} from '../reducerIndex';
import * as redux from 'redux';


const singleProfile: ConsultantProfile = {
    abstract: "Lorem Ipsum",
    languages: [{name: "Englisch", languageLevel: LanguageLevel.Expert}, {name:"Russisch", languageLevel: LanguageLevel.Native}],
    sectors: ["Luftfahrt", "Logistik"],
    qualifications: [{date: new Date(), name: "Irgend ein ISO Zeug"}],
    career: [{startDate: new Date(), endDate: new Date(), name: "Entwickler"}, {startDate: new Date(), endDate: new Date(), name: "Senior-Entwickler"}],
    education: [{date: new Date(), name: "Bachelor Informatik"}]
};


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
    public static requestSingleProfile(initials: string) {
        return function(dispatch: redux.Dispatch<AllConsultantsState>) {
            // Dispatch the action that sets the status to "Request Pendign" or similar
            dispatch(ProfileActionCreator.requestingFullProfile());
            // Perform the actual request
            // FIXME make async axios call.
            dispatch(ProfileActionCreator.receiveFullProfile(singleProfile));
            // uncomment when an error occurs during axios call
            //dispatch(ProfileActionCreator.failRequestFullProfile())

        }
    }
}