import {APIRequestType, RequestStatus} from '../../Store';
import {isNullOrUndefined} from 'util';
import {
    ChangeAbstractAction,
    ChangeLanguageSkillLevelAction,
    ChangeLanguageSkillNameAction,
    ReceiveAPIResponseAction
} from './singleProfileActions';
import {AbstractAction, ActionType} from '../reducerIndex';
import {LanguageSkill} from '../../model/LanguageSkill';
import {deepFreeze} from '../../utils/ObjectUtil';
import {InternalDatabase} from '../../model/InternalDatabase';
import * as $ from "jquery";


const initialState: InternalDatabase = new InternalDatabase();
console.log(initialState);
initialState.APIRequestStatus = RequestStatus.Successful;


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
function handleChangeAbstract(state: InternalDatabase, action: ChangeAbstractAction): InternalDatabase {
    let newState: InternalDatabase = Object.assign({}, state);
    newState.description = action.newAbstract;
    return newState;
}

function handleReceiveFullProfile(state: InternalDatabase, action: ReceiveAPIResponseAction) : InternalDatabase {
    // To keep the code in the databaseReducer class itself clean, a full clone of the old databaseReducer is created, on which all
    // further operations are then performed.
    let clonedState: InternalDatabase = $.extend(true,  new InternalDatabase(), state);
    console.log("Cloned state:", clonedState);
    clonedState.parseFromAPI(action.payload);
    return clonedState;
}

function handleRequestLanguageSuccess(state: InternalDatabase, languages: Array<any>): InternalDatabase {
    // Clone state to allow mutation
    let clonedState: InternalDatabase = $.extend(true,  new InternalDatabase(), state);
    clonedState.addAPILanguages(languages);
    return clonedState;
}

function handleRequestAPISuccess(state: InternalDatabase, action: ReceiveAPIResponseAction): InternalDatabase {
    let newState: InternalDatabase;
    if(action.requestType === APIRequestType.RequestLanguages) {
        newState = handleRequestLanguageSuccess(state, action.payload);
    } else if(action.requestType === APIRequestType.RequestProfile) {
        newState = handleReceiveFullProfile(state, action);
    } else if(action.requestType === APIRequestType.SaveProfile) {
        newState = state;
    }
    return Object.assign({}, newState, {APIRequestStatus : RequestStatus.Successful});
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

        // == Language Suggestion requests == //
        case ActionType.APIRequestPending:
            return Object.assign({}, state, {APIRequestStatus: RequestStatus.Pending});
        case ActionType.APIRequestFail:
            return Object.assign({}, state, {APIRequestStatus: RequestStatus.Failiure});
        case ActionType.APIRequestSuccess:
            return handleRequestAPISuccess(state, <ReceiveAPIResponseAction> action);
        default:
            return state;
    }
}