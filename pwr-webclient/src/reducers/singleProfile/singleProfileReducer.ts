import {RequestStatus} from '../../Store';
import {isNullOrUndefined} from 'util';
import {
    ChangeAbstractAction,
    ChangeLanguageSkillLevelAction,
    ChangeLanguageSkillNameAction,
    ReceiveFullProfileAction, RequestLanguagesSuccess
} from './singleProfileActions';
import {AbstractAction, ActionType} from '../reducerIndex';
import {LanguageSkill} from '../../model/LanguageSkill';
import {deepFreeze} from '../../utils/ObjectUtil';
import {InternalDatabase} from '../../model/InternalDatabase';
import * as $ from "jquery";


const initialState: InternalDatabase = new InternalDatabase();
console.log(initialState);
initialState.saveProfileStatus = RequestStatus.Successful;
initialState.requestProfileStatus = RequestStatus.Successful;


function handleChangeLanguageSkill(state: InternalDatabase, action: ChangeLanguageSkillNameAction) : InternalDatabase {
    let newLanguage : LanguageSkill = Object.assign(
        {}, // The new object. Has to be a copy, so its empty.
        state.languageSkillById[action.languageSkillId], // Copy all previous values.
        {languageId: action.newLanguageId} // Assign the changed id.
    );
    // Copy the whole array.
    let newLangSkills: Array<LanguageSkill> = state.languageSkillById.slice(0);
    // Replace the skill.
    newLangSkills[newLanguage.id] = newLanguage;
    let newState: InternalDatabase = Object.assign({}, state);
    newState.languageSkillById = newLangSkills;
    return newState;
}

function handleChangeLanguageSkillLevel(state: InternalDatabase, action: ChangeLanguageSkillLevelAction): InternalDatabase {
    let newLanguage : LanguageSkill = Object.assign(
        {}, // The new object. Has to be a copy, so its empty.
        state.languageSkillById[action.languageSkillId]
    );
    newLanguage.level = action.newLanguageLevel;
    // Copy the whole array.
    let newLangSkills: Array<LanguageSkill> = state.languageSkillById.slice(0);
    // Replace the skill.
    newLangSkills[newLanguage.id] = newLanguage;
    let newState: InternalDatabase = Object.assign({}, state);
    newState.languageSkillById = newLangSkills;
    return newState;
}


function handleReceiveFullProfile(state: InternalDatabase, action: ReceiveFullProfileAction) : InternalDatabase {
    // To keep the code in the databaseReducer class itself clean, a full clone of the old databaseReducer is created, on which all
    // further operations are then performed.
    let clonedState: InternalDatabase = $.extend(true,  new InternalDatabase(), state);
    console.log("Cloned state:", clonedState);
    clonedState.parseFromAPI(action.apiProfile);

    clonedState.requestProfileStatus = RequestStatus.Successful;
    return clonedState;
}

function handleRequestingFullProfile(state: InternalDatabase, action: AbstractAction) : InternalDatabase {

    let newState: InternalDatabase = Object.assign({}, state);
    newState.requestProfileStatus = RequestStatus.Pending;
    return newState;
}

function handleFailRequestFullProfile(state: InternalDatabase, action: AbstractAction) : InternalDatabase {
    let newState: InternalDatabase = Object.assign({}, state);
    newState.requestProfileStatus = RequestStatus.Failiure;
    return newState;
}

function handleChangeAbstract(state: InternalDatabase, action: ChangeAbstractAction): InternalDatabase {
    let newState: InternalDatabase = Object.assign({}, state);
    newState.description = action.newAbstract;


    return newState;
}


function handleRequestLanguageSuccess(state: InternalDatabase, requestLanguagesSuccess: RequestLanguagesSuccess): InternalDatabase {
    // Clone state to allow mutation
    let clonedState: InternalDatabase = $.extend(true,  new InternalDatabase(), state);
    clonedState.requestLanguagesStatus = RequestStatus.Successful;
    clonedState.addAPILanguages(requestLanguagesSuccess.languages);
    return clonedState;
}
/**
 * Reducer for the single profile part of the global state.
 * @param state
 * @param action
 * @returns {SingleProfile}
 */
export function databaseReducer(state : InternalDatabase, action: AbstractAction) : InternalDatabase {
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
            return handleReceiveFullProfile(state, <ReceiveFullProfileAction> action);
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
        case ActionType.RequestingLanguages:
            return Object.assign({}, state, {requestLanguagesStatus: RequestStatus.Pending});
        case ActionType.RequestingLanguagesFail:
            return Object.assign({}, state, {requestLanguagesStatus: RequestStatus.Failiure});
        case ActionType.RequestingLanguagesSuccess:
            return handleRequestLanguageSuccess(state, <RequestLanguagesSuccess> action);
        default:
            return state;
    }
}