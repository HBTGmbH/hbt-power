import {LanguageLevel, LanguageSkill, RequestStatus, SingleProfile} from '../../Store';
import {isNullOrUndefined} from 'util';
import {ChangeLanguageSkillAction} from './singleProfileActions';
import {AbstractAction, ActionType} from '../reducerIndex';
const initialState: SingleProfile = {
    profile: {
        abstract: "Lorem Ipsum",
        languages: [],
        sectors: [],
        qualifications: [],
        career: [],
        education: []
    },
    possibleSectors : ["Luftfahrt", "Schiffahrt", "Logistik", "Autovermiterung", "Presse"],
    possibleLanguageNames: ["Englisch", "Deutsch", "Französisch", "Chinesisch", "Russisch", "Spanisch"],
    requestProfileStatus: RequestStatus.Successful
};


function handleChangeLanguageSkill(state: SingleProfile, action: ChangeLanguageSkillAction) : SingleProfile {
    let newLanguages : Array<LanguageSkill>;
    newLanguages = [
        ...state.profile.languages.slice(0, action.index),
        action.languageSkill,
        ...state.profile.languages.slice(action.index + 1)
    ];
    return Object.assign({}, state, {languages: newLanguages});
}

/**
 * Reducer for the single profile part of the global state.
 * @param state
 * @param action
 * @returns {SingleProfile}
 */
export function singleProfile(state : SingleProfile, action: AbstractAction) : SingleProfile {
    if(isNullOrUndefined(state)) {
        state = initialState;
    }
    console.log("Profile Reducer called for action type " + ActionType[action.type]);
    switch(action.type) {
        case ActionType.ChangeLanguageSkill:
            return handleChangeLanguageSkill(state, <ChangeLanguageSkillAction> action );
        default:
            return state;
    }
}