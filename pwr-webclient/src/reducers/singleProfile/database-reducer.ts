import {APIRequestType, ProfileElementType, RequestStatus} from '../../Store';
import {isNullOrUndefined} from 'util';
import {
    ChangeStringValueAction,
    CreateEntryAction,
    DeleteEntryAction,
    ReceiveAPIResponseAction,
    SaveEntryAction
} from './database-actions';
import {AbstractAction, ActionType} from '../reducerIndex';
import {deepFreeze} from '../../utils/ObjectUtil';
import {InternalDatabase} from '../../model/InternalDatabase';
import {Profile} from '../../model/Profile';
import {ProfileReducer} from './profile-reducer';
import {NameEntity} from '../../model/NameEntity';


const initialState: InternalDatabase = InternalDatabase.createWithDefaults();

function handleChangeAbstract(state: InternalDatabase, action: ChangeStringValueAction): InternalDatabase {
    let newProfile: Profile = state.profile.changeDescription(action.value);
    return state.updateProfile(newProfile);
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
        newState = state.parseProfile(action.payload.profile);
    } else if(action.requestType === APIRequestType.RequestEducations) {
        newState = state.addAPIEducations(action.payload);
    } else if(action.requestType === APIRequestType.RequestQualifications) {
        newState = state.addAPIQualifications(action.payload);
    } else if(action.requestType === APIRequestType.RequestCareers) {
        newState = state.addAPITrainings(action.payload);
    } else if(action.requestType === APIRequestType.RequestSectors) {
        newState = state.addAPISectors(action.payload);
    }
    return newState.changeAPIRequestStatus(RequestStatus.Successful);
}

function updateNameEntity(database: InternalDatabase, entity: NameEntity, type: ProfileElementType): InternalDatabase {
    switch(type) {
        case ProfileElementType.TrainingEntry:
            return database.updateTraining(entity);
        case ProfileElementType.SectorEntry:
            return database.updateSector(entity);
        case ProfileElementType.EducationEntry:
            return database.updateEducation(entity);
        case ProfileElementType.QualificationEntry:
            return database.updateQualification(entity);
        case ProfileElementType.LanguageEntry:
            return database.updateLanguage(entity);
        default:
            return database;
    }
}

function handleSaveEntry(database: InternalDatabase, action: SaveEntryAction): InternalDatabase {
    if(!isNullOrUndefined(action.nameEntity) && action.nameEntity.isNew) {
        database = updateNameEntity(database, action.nameEntity, action.entryType);
    }
    let profile: Profile = ProfileReducer.reducerUpdateEntry(database.profile, action);
    return database.updateProfile(profile);
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
    console.log('ConsultantProfile Reducer called for action type ' + ActionType[action.type]);
    switch(action.type) {
        // == Profile Element modification == //
        case ActionType.ChangeAbstract:
            return handleChangeAbstract(state, <ChangeStringValueAction> action);
        case ActionType.DeleteEntry: {
            let newProfile: Profile = ProfileReducer.reducerHandleRemoveEntry(state.profile, <DeleteEntryAction> action);
            return state.updateProfile(newProfile);
        }
        case ActionType.CreateEntry: {
            let newProfile: Profile = ProfileReducer.reducerHandleCreateEntry(state.profile, <CreateEntryAction> action);
            return state.updateProfile(newProfile);
        }
        case ActionType.SaveEntry: {
            return handleSaveEntry(state, <SaveEntryAction>action);
        }
        case ActionType.ChangeCurrentPosition: {
            let newProfile: Profile = ProfileReducer.reducerHandleChangeCurrentPosition(state.profile, <ChangeStringValueAction> action);
            return state.updateProfile(newProfile);
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