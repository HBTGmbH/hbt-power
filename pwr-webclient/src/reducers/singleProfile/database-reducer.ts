import {APIRequestType, RequestStatus} from '../../Store';
import {isNullOrUndefined} from 'util';
import {
    ChangeAbstractAction,
    ChangeDateAction,
    ChangeItemIdAction,
    ChangeLanguageSkillLevelAction,
    ReceiveAPIResponseAction, DeleteEntryAction
} from './singleProfileActions';
import {AbstractAction, ActionType} from '../reducerIndex';
import {LanguageSkill} from '../../model/LanguageSkill';
import {deepFreeze} from '../../utils/ObjectUtil';
import {InternalDatabase} from '../../model/InternalDatabase';
import {Profile} from '../../model/Profile';
import {ProfileReducer} from './profile-reducer';
import {CareerElement} from '../../model/CareerElement';
import {SectorEntry} from '../../model/SectorEntry';


const initialState: InternalDatabase = InternalDatabase.createWithDefaults();

function handleChangeLanguageSkillLevel(state: InternalDatabase, action: ChangeLanguageSkillLevelAction): InternalDatabase {
    let newLangSkill: LanguageSkill = state.profile.languageSkills.get(action.languageSkillId).changeLevel(action.newLanguageLevel);
    let newProfile: Profile = state.profile.updateLanguageSkill(newLangSkill);
    return state.changeProfile(newProfile);
}
function handleChangeAbstract(state: InternalDatabase, action: ChangeAbstractAction): InternalDatabase {
    let newProfile: Profile = state.profile.changeDescription(action.newAbstract);
    return state.changeProfile(newProfile);
}

// FIXME move to database reducer
function handleRequestAPISuccess(state: InternalDatabase, action: ReceiveAPIResponseAction): InternalDatabase {
    let newState: InternalDatabase;
    // FIXME switch-i-fy
    if(action.requestType === APIRequestType.RequestLanguages) {
        newState = state.addAPILanguages(action.payload);
    } else if(action.requestType === APIRequestType.RequestProfile) {
        newState = state.parseProfile(action.payload);
    } else if(action.requestType === APIRequestType.SaveProfile) {
        newState = state;
    } else if(action.requestType === APIRequestType.RequestEducations) {
        newState = state.addAPIEducations(action.payload);
    } else if(action.requestType === APIRequestType.RequestQualifications) {
        newState = state.addAPIQualifications(action.payload);
    } else if(action.requestType === APIRequestType.RequestCareers) {
        newState = state.addAPICareers(action.payload);
    } else if(action.requestType === APIRequestType.RequestSectors) {
        newState = state.addAPISectors(action.payload);
    } else if(action.requestType === APIRequestType.SaveCareerElement) {
        console.log(action.payload);
        newState = state.changeProfile(state.profile.updateCareerElement(CareerElement.create(action.payload)));
    } else if(action.requestType === APIRequestType.SaveSectorEntry){
        newState = state.changeProfile(state.profile.updateSectorEntry(SectorEntry.create(action.payload)));
    } else if(action.requestType === APIRequestType.SaveLanguageSkill) {
        newState = state.changeProfile(state.profile.updateLanguageSkill(LanguageSkill.create(action.payload)));
    }
    return newState.changeAPIRequestStatus(RequestStatus.Successful);
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
        case ActionType.ChangeLanguageSkillLevel:
            return handleChangeLanguageSkillLevel(state, <ChangeLanguageSkillLevelAction> action);
        case ActionType.ChangeDate: {
            let newProfile: Profile = ProfileReducer.reducerHandleChangeDate(state.profile, <ChangeDateAction> action);
            return state.changeProfile(newProfile);
        }
        case ActionType.ChangeItemId: {
            let newProfile: Profile = ProfileReducer.reducerHandleItemIdChange(state.profile, <ChangeItemIdAction> action);
            return state.changeProfile(newProfile);
        }
        case ActionType.DeleteEntry: {
            let newProfile: Profile = ProfileReducer.reducerHandleRemoveEntry(state.profile, <DeleteEntryAction> action);
            return state.changeProfile(newProfile);
        }
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