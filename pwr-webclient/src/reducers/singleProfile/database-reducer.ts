import {APIRequestType, ProfileElementType, RequestStatus} from '../../Store';
import {isNullOrUndefined} from 'util';
import {
    ChangeStringValueAction,
    CreateEntryAction,
    DeleteEntryAction,
    DeleteProjectAction, DeleteSkillAction, LoginAction,
    ReceiveAPIResponseAction,
    SaveEntryAction,
    SaveProjectAction, UpdateSkillRatingAction
} from './database-actions';
import {AbstractAction, ActionType} from '../reducerIndex';
import {deepFreeze} from '../../utils/ObjectUtil';
import {InternalDatabase} from '../../model/InternalDatabase';
import {Profile} from '../../model/Profile';
import {ProfileReducer} from './profile-reducer';
import {NameEntity} from '../../model/NameEntity';
import {Project} from '../../model/Project';
import {APINameEntity} from '../../model/APIProfile';
import {browserHistory} from 'react-router'



const initialState: InternalDatabase = InternalDatabase.createWithDefaults();

function addAPINameEntities(names: Array<APINameEntity>, reference: Immutable.Map<string, NameEntity>): Immutable.Map<string, NameEntity> {
    let res: Immutable.Map<string, NameEntity> = reference;
    names.forEach(apiName => {
        let name: NameEntity = NameEntity.fromAPI(apiName);
        res = res.set(name.id(), name);
    });
    return res;
}

function handleChangeAbstract(state: InternalDatabase, action: ChangeStringValueAction): InternalDatabase {
    let newProfile: Profile = state.profile().description(action.value);
    return state.profile(newProfile);
}

// FIXME move to database reducer
function handleRequestAPISuccess(state: InternalDatabase, action: ReceiveAPIResponseAction): InternalDatabase {
    let newState: InternalDatabase;
    switch(action.requestType) {
        case APIRequestType.RequestLanguages:
            newState = state.languages(addAPINameEntities(action.payload, state.languages()));
            break;
        case APIRequestType.RequestProfile:
            newState = state.parseProfile(action.payload);
            break;
        case APIRequestType.SaveProfile:
            newState = state.parseProfile(action.payload.profile);
            break;
        case APIRequestType.RequestEducations:
            newState = state.educations(addAPINameEntities(action.payload, state.educations()));
            break;
        case APIRequestType.RequestQualifications:
            newState = state.qualifications(addAPINameEntities(action.payload, state.qualifications()));
            break;
        case APIRequestType.RequestCareers:
            newState = state.trainings(addAPINameEntities(action.payload, state.trainings()));
            break;
        case APIRequestType.RequestSectors:
            newState = state.sectors(addAPINameEntities(action.payload, state.sectors()));
            break;
        case APIRequestType.RequestProjectRoles:
            newState = state.projectRoles(addAPINameEntities(action.payload, state.projectRoles()));
            break;
        case APIRequestType.RequestCompanies:
            newState = state.companies(addAPINameEntities(action.payload, state.companies()));
            break;

    }
    return newState.APIRequestStatus(RequestStatus.Successful);
}

function updateNameEntity(database: InternalDatabase, entity: NameEntity, type: ProfileElementType): InternalDatabase {
    switch(type) {
        case ProfileElementType.TrainingEntry:
            return database.trainings(database.trainings().set(entity.id(), entity));
        case ProfileElementType.SectorEntry:
            return database.sectors(database.sectors().set(entity.id(), entity));
        case ProfileElementType.EducationEntry:
            return database.educations(database.educations().set(entity.id(), entity));
        case ProfileElementType.QualificationEntry:
            return database.qualifications(database.qualifications().set(entity.id(), entity));
        case ProfileElementType.LanguageEntry:
            return database.languages(database.languages().set(entity.id(), entity));
        default:
            return database;
    }
}

function handleSaveEntry(database: InternalDatabase, action: SaveEntryAction): InternalDatabase {
    if(!isNullOrUndefined(action.nameEntity) && action.nameEntity.isNew) {
        database = updateNameEntity(database, action.nameEntity, action.entryType);
    }
    let profile: Profile = ProfileReducer.reducerUpdateEntry(database.profile(), action);
    return database.profile(profile);
}

function handleSaveProject(database: InternalDatabase, action: SaveProjectAction): InternalDatabase {
    // project with role IDs cleared.
    let project: Project = action.state.project.roleIds(action.state.project.roleIds().clear());
    project = project.roleIds(project.roleIds().clear());
    action.state.roles.forEach(role => {
        let projectRole: NameEntity = InternalDatabase.findNameEntityByName(role, database.projectRoles());
        if(isNullOrUndefined(projectRole)) {
            projectRole = NameEntity.createNew(role);
            database = database.projectRoles(database.projectRoles().set(projectRole.id(), projectRole));
        }
        project = project.roleIds(project.roleIds().push(projectRole.id()));
    });

    // Fix end customer and broker
    let broker: NameEntity = InternalDatabase.findNameEntityByName(action.state.brokerACValue, database.companies());
    if(isNullOrUndefined(broker)) {
        broker = NameEntity.createNew(action.state.brokerACValue);
        database = database.companies(database.companies().set(broker.id(), broker));
    }
    project = project.brokerId(broker.id());

    // End customer
    let endCustomer: NameEntity = InternalDatabase.findNameEntityByName(action.state.clientACValue, database.companies());
    if(isNullOrUndefined(endCustomer)) {
        endCustomer = NameEntity.createNew(action.state.brokerACValue);
        database = database.companies(database.companies().set(endCustomer.id(), endCustomer));
    }
    project = project.endCustomerId(endCustomer.id());

    let profile: Profile = ProfileReducer.reducerHandleSaveProject(database.profile(), project, action.state.rawSkills);
    return database.profile(profile);
}

function handleLogInUser(state: InternalDatabase, action: LoginAction): InternalDatabase {
    browserHistory.push('/home');
    return state.loggedInUser(action.initials); // TODO
}

/**
 * Reducer for the single profile part of the global state.
 * @param state
 * @param action
 */
export function databaseReducer(state : InternalDatabase, action: AbstractAction) : InternalDatabase {
    if(isNullOrUndefined(state)) {
        state = initialState;
    }
    deepFreeze(state);
    console.log('DatabaseReducer called for action type ' + ActionType[action.type]);
    switch(action.type) {
        // == Profile Element modification == //
        case ActionType.ChangeAbstract:
            return handleChangeAbstract(state, <ChangeStringValueAction> action);
        case ActionType.DeleteEntry: {
            let newProfile: Profile = ProfileReducer.reducerHandleRemoveEntry(state.profile(), <DeleteEntryAction> action);
            return state.profile(newProfile);
        }
        case ActionType.CreateEntry: {
            let newProfile: Profile = ProfileReducer.reducerHandleCreateEntry(state.profile(), <CreateEntryAction> action);
            return state.profile(newProfile);
        }
        case ActionType.SaveEntry: {
            return handleSaveEntry(state, <SaveEntryAction>action);
        }
        case ActionType.ChangeCurrentPosition: {
            let newProfile: Profile = ProfileReducer.reducerHandleChangeCurrentPosition(state.profile(), <ChangeStringValueAction> action);
            return state.profile(newProfile);
        }
        case ActionType.SaveProject: {
            return handleSaveProject(state, <SaveProjectAction>action);
        }
        case ActionType.DeleteProject: {
            let idToRemove: string = (<DeleteProjectAction> action).id;
            let newProfile: Profile = state.profile();
            newProfile = newProfile.projects(newProfile.projects().remove(idToRemove));
            return state.profile(newProfile);
        }
        case ActionType.CreateProject: {
            let newProfile: Profile = state.profile();
            let proj: Project = Project.createNew();
            newProfile = newProfile.projects(newProfile.projects().set(proj.id(), proj));
            return state.profile(newProfile);
        }
        case ActionType.UpdateSkillRating: {
            return state.profile(ProfileReducer.reducerHandleUpdateSkillRating(state.profile(), <UpdateSkillRatingAction>action));
        }
        case ActionType.DeleteSkill: {
            return state.profile(ProfileReducer.reducerHandleDeleteSkill(state.profile(), <DeleteSkillAction> action));
        }
        // == Language Suggestion requests == //
        case ActionType.APIRequestPending:
            return state.APIRequestStatus(RequestStatus.Pending);
        case ActionType.APIRequestFail:
            return state.APIRequestStatus(RequestStatus.Failiure);
        case ActionType.APIRequestSuccess:
            return handleRequestAPISuccess(state, <ReceiveAPIResponseAction> action);
        case ActionType.LogInUser:
            return handleLogInUser(state, <LoginAction> action);
        default:
            return state;
    }
}