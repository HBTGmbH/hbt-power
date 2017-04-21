import {LanguageLevel, LanguageSkill, RequestStatus, SingleProfile} from '../../Store';
import {isNullOrUndefined} from 'util';
import {ChangeLanguageSkillAction, ReceiveFullProfileAction} from './singleProfileActions';
import {AbstractAction, ActionType} from '../reducerIndex';
import {ReceiveSingleConsultantAction} from '../consultants/consultant_actions';
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


function handleReceiveSingleConsultant(state: SingleProfile, action: ReceiveFullProfileAction) : SingleProfile {
    return Object.assign({}, state, {profile: action.profile, requestProfileStatus: RequestStatus.Successful});
}

function handleRequestingFullProfile(state: SingleProfile, action: AbstractAction) : SingleProfile {
    return Object.assign({}, state, {requestProfileStatus: RequestStatus.Pending});
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
        case ActionType.ReceiveFullProfile:
            return handleReceiveSingleConsultant(state, <ReceiveFullProfileAction> action);
        case ActionType.RequestingFullProfile:
            return handleRequestingFullProfile(state, action);
        default:
            return state;
    }
}