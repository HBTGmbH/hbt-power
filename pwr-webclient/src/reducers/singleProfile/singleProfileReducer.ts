import {APIRequestType, DateFieldType, RequestStatus} from '../../Store';
import {isNullOrUndefined} from 'util';
import {
    ChangeAbstractAction,
    ChangeDateAction,
    ChangeLanguageSkillLevelAction,
    ChangeLanguageSkillNameAction,
    ReceiveAPIResponseAction
} from './singleProfileActions';
import {AbstractAction, ActionType} from '../reducerIndex';
import {LanguageSkill} from '../../model/LanguageSkill';
import {deepFreeze} from '../../utils/ObjectUtil';
import {InternalDatabase} from '../../model/InternalDatabase';
import {EducationEntry} from '../../model/EducationEntry';
import {QualificationEntry} from '../../model/QualificationEntry';
import {CareerElement} from '../../model/CareerElement';
import {Profile} from '../../model/Profile';


const initialState: InternalDatabase = InternalDatabase.createWithDefaults();


function handleChangeLanguageSkill(state: InternalDatabase, action: ChangeLanguageSkillNameAction) : InternalDatabase {
    // New language skill
    let newLangSkill: LanguageSkill = state.profile.languageSkills.get(action.languageSkillId).changeLanguageId(action.newLanguageId);
    let newProfile: Profile = state.profile.updateLanguageSkill(newLangSkill);
    return state.changeProfile(newProfile);
}

function handleChangeLanguageSkillLevel(state: InternalDatabase, action: ChangeLanguageSkillLevelAction): InternalDatabase {
    let newLangSkill: LanguageSkill = state.profile.languageSkills.get(action.languageSkillId).changeLevel(action.newLanguageLevel);
    let newProfile: Profile = state.profile.updateLanguageSkill(newLangSkill);
    return state.changeProfile(newProfile);
}
function handleChangeAbstract(state: InternalDatabase, action: ChangeAbstractAction): InternalDatabase {
    let newProfile: Profile = state.profile.changeDescription(action.newAbstract);
    return state.changeProfile(newProfile);
}

function handleReceiveFullProfile(state: InternalDatabase, action: ReceiveAPIResponseAction) : InternalDatabase {
    return state.parseProfile(action.payload);
}

function handleRequestLanguageSuccess(state: InternalDatabase, languages: Array<any>): InternalDatabase {
    return state.addAPILanguages(languages);
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
    return newState.changeAPIRequestStatus(RequestStatus.Successful);
}

function handleChangeDate(state: InternalDatabase, action: ChangeDateAction): InternalDatabase {
    switch (action.targetField) {
        case DateFieldType.CareerFrom: {
            let element: CareerElement = state.profile.careerElements.get(action.targetFieldId).changeStartDate(action.newDate);
            let newProfile: Profile = state.profile.updateCareerElement(element);
            return state.changeProfile(newProfile);
        }
        case DateFieldType.CareerTo: {
           let element: CareerElement = state.profile.careerElements.get(action.targetFieldId).changeEndDate(action.newDate);
           let newProfile: Profile = state.profile.updateCareerElement(element);
           return state.changeProfile(newProfile);
        }
        case DateFieldType.EducationDate: {
            let educationEntry: EducationEntry = state.profile.educationEntries.get(action.targetFieldId).changeDate(action.newDate);
            let newProfile: Profile = state.profile.updateEducationEntry(educationEntry);
            return state.changeProfile(newProfile);
        }
        case DateFieldType.QualificationDate: {
           let qualificationEntry: QualificationEntry = state.profile.qualificationEntries.get(action.targetFieldId).changeDate(action.newDate);
           let newProfile: Profile= state.profile.updateQualificationEntry(qualificationEntry);
           return state.changeProfile(newProfile);
        }
        default:
            return state;
    }
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
        case ActionType.ChangeDate:
            return handleChangeDate(state, <ChangeDateAction> action);
        // == Language Suggestion requests == //
        case ActionType.APIRequestPending:
            return state.changeAPIRequestStatus(RequestStatus.Pending);
        case ActionType.APIRequestFail:
            return state.changeAPIRequestStatus(RequestStatus.Failiure);
        case ActionType.APIRequestSuccess:
            return handleRequestAPISuccess(state, <ReceiveAPIResponseAction> action);
        default:
            return state;
    }
}