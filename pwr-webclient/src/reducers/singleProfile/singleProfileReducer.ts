import {RequestStatus, SingleProfile} from '../../Store';
import {isNullOrUndefined} from 'util';
import {
    ChangeAbstractAction,
    ChangeLanguageSkillLevelAction, ChangeLanguageSkillNameAction, ProfileAsyncActionCreator,
    ReceiveFullProfileAction
} from './singleProfileActions';
import {AbstractAction, ActionType} from '../reducerIndex';
import {LanguageSkill} from '../../model/LanguageSkill';
import {deepFreeze} from '../../utils/ObjectUtil';
import {Profile} from '../../model/Profile';
const initialState: SingleProfile = {
    profile: {
        sectors: [],
        languages: [],
        career: [],
        education: [],
        currentPosition: "Berater",
        description: "Lorem Ipsum",
        qualification: [],
        id: -1
    },
    possibleSectors : [],
    possibleLanguageNames: [],
    possibleLanguageLevels: ["Beginner", "Apprentice", "Expert", "Native"],
    requestProfileStatus: RequestStatus.Successful,
    saveProfileStatus: RequestStatus.Successful
};

function initInitialState() {
    initialState.possibleSectors = [];
    initialState.possibleSectors[1] = {id:1, name:"Luftfahrt"};
    initialState.possibleSectors[2] = {id:2, name:"Schiffahrt"};
    initialState.possibleSectors[3] = {id:3, name:"Logistik"};
    initialState.possibleSectors[4] = {id:4, name:"Autovermietung"};
    initialState.possibleSectors[5] = {id:5, name:"Presse"};

    initialState.possibleLanguageNames = [];
    initialState.possibleLanguageNames[1] = {id:1, name:"Englisch"};
    initialState.possibleLanguageNames[2] = {id:2, name:"Deutsch"};
    initialState.possibleLanguageNames[3] = {id:3, name:"Französisch"};
    initialState.possibleLanguageNames[4] = {id:4, name:"Chinesisch"};
    initialState.possibleLanguageNames[5] = {id:5, name:"Russisch"};
    initialState.possibleLanguageNames[6] = {id:6, name:"Spanisch"};
}

initInitialState();

function handleChangeLanguageSkill(state: SingleProfile, action: ChangeLanguageSkillNameAction) : SingleProfile {
    let newLanguage = Object.assign({},
        state.profile.languages[action.index],
        {
            language: {name: action.newName}
        }
        );
    let newLanguages : Array<LanguageSkill>;
    newLanguages = [
        ...state.profile.languages.slice(0, action.index),
        newLanguage,
        ...state.profile.languages.slice(action.index + 1)
    ];
    let newProfile = Object.assign({}, state.profile, {languages: newLanguages});
    return Object.assign({}, state, {profile:newProfile});
}

function handleChangeLanguageSkillLevel(state: SingleProfile, action: ChangeLanguageSkillLevelAction) {
    let newLanguage = Object.assign({}, state.profile.languages[action.index], {level: action.newLevel});
    let newLanguages : Array<LanguageSkill>;
    newLanguages = [
        ...state.profile.languages.slice(0, action.index),
        newLanguage,
        ...state.profile.languages.slice(action.index + 1)
    ];
    let newProfile = Object.assign({}, state.profile, {languages: newLanguages});
    return Object.assign({}, state, {profile:newProfile});
}


function handleReceiveSingleConsultant(state: SingleProfile, action: ReceiveFullProfileAction) : SingleProfile {
    return Object.assign({}, state, {profile: action.profile, requestProfileStatus: RequestStatus.Successful});
}

function handleRequestingFullProfile(state: SingleProfile, action: AbstractAction) : SingleProfile {
    return Object.assign({}, state, {requestProfileStatus: RequestStatus.Pending});
}

function handleFailRequestFullProfile(state: SingleProfile, action: AbstractAction) {
    return Object.assign({}, state, {requestProfileStatus: RequestStatus.Failiure});
}

function handleChangeAbstract(state: SingleProfile, action: ChangeAbstractAction): SingleProfile {
    let newProfile : Profile = Object.assign({}, state.profile, {description: action.newAbstract});
    return Object.assign({}, state, {profile: newProfile});
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
    deepFreeze(state);
    console.log("ConsultantProfile Reducer called for action type " + ActionType[action.type]);
    switch(action.type) {
        // == Profile Element modification == //
        case ActionType.ChangeAbstract:
            return handleChangeAbstract(state, <ChangeAbstractAction> action);
        case ActionType.ChangeLanguageSkillName:
            return handleChangeLanguageSkill(state, <ChangeLanguageSkillNameAction> action );
        case ActionType.ChangeLanguageSkillLevel:
            return handleChangeLanguageSkillLevel(state, <ChangeLanguageSkillLevelAction> action);
        // == Profile reeading from API == //
        case ActionType.ReceiveFullProfile:
            return handleReceiveSingleConsultant(state, <ReceiveFullProfileAction> action);
        case ActionType.RequestingFullProfile:
            return handleRequestingFullProfile(state, action);
        case ActionType.FailRequestFullProfile:
            return handleFailRequestFullProfile(state, action);
        // == Profile saving to API == //
        case ActionType.SaveFullProfile:
            return Object.assign({}, state, {saveProfileStatus: RequestStatus.Pending});
        case ActionType.SaveFullProfileFail:
            return Object.assign({}, state, {saveProfileStatus: RequestStatus.Failiure});
        case ActionType.SaveFullProfilSuccess:
            return Object.assign({}, state, {saveProfileStatus: RequestStatus.Successful});
        default:
            return state;
    }
}