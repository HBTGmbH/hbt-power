import {APIRequestType, ProfileElementType, RequestStatus} from '../../Store';
import {isNullOrUndefined} from 'util';
import {
    AbstractAction,
    ChangeStringValueAction,
    CreateEntryAction,
    DeleteEntryAction,
    DeleteProjectAction, DeleteSkillAction, DeleteViewProfileAction, LoginAction,
    ReceiveAPIResponseAction,
    SaveEntryAction,
    SaveProjectAction, SaveViewProfileAction, SelectViewProfileAction, SetSelectedIndexesAction,
    UpdateSkillRatingAction, ViewProfileSortAction
} from './database-actions';
import {InternalDatabase} from '../../model/InternalDatabase';
import {Profile} from '../../model/Profile';
import {ProfileReducer} from './profile-reducer';
import {NameEntity} from '../../model/NameEntity';
import {Project} from '../../model/Project';
import {APINameEntity} from '../../model/APIProfile';
import {browserHistory} from 'react-router'
import {ActionType} from '../ActionType';
import {ViewElement} from '../../model/viewprofile/ViewElement';
import * as Immutable from 'immutable';



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
    browserHistory.push('/app/home');
    return state.loggedInUser(action.initials); // TODO
}

function handleSaveViewProfiles(state: InternalDatabase, action: SaveViewProfileAction): InternalDatabase {
    return state.viewProfiles(state.viewProfiles().set(action.viewProfile.id(), action.viewProfile));
}

function handleDeleteViewProfile(state: InternalDatabase, action: DeleteViewProfileAction): InternalDatabase {
    return state.viewProfiles(state.viewProfiles().remove(action.id));
}

function handleSelectViewProfile(state: InternalDatabase, action: SelectViewProfileAction): InternalDatabase {
    browserHistory.push("/app/view");
    return state.activeViewProfileId(action.id);
}

function handleSetSelectedIndexes(state: InternalDatabase, action: SetSelectedIndexesAction): InternalDatabase {
    let viewProfile = state.viewProfiles().get(action.viewProfileId);
    let ref: Immutable.List<ViewElement> = null;
    switch(action.elementType) {
        case ProfileElementType.SectorEntry:
            ref = viewProfile.viewSectorEntries();
            break;
        case ProfileElementType.EducationEntry:
            ref = viewProfile.viewEducationEntries();
            break;
        case ProfileElementType.QualificationEntry:
            ref = viewProfile.viewQualificationEntries();
            break;
        case ProfileElementType.TrainingEntry:
            ref = viewProfile.viewTrainingEntries();
            break;
        case ProfileElementType.LanguageEntry:
            ref = viewProfile.viewLanguageEntries();
            break;
    }
    if(action.selectedIndexes == 'all') {
        ref = Immutable.List<ViewElement>(ref.map(view => view.enabled(true)));
    } else if(action.selectedIndexes == 'none') {
        ref = Immutable.List<ViewElement>(ref.map(view => view.enabled(false)));
        console.log(ref);
    } else {
        ref = Immutable.List<ViewElement>(ref.map(view => view.enabled(false)));
        let array: Array<number> = action.selectedIndexes as Array<number>;
        array.forEach(index => {
            ref = ref.set(index, ref.get(index).enabled(true))
        });
        ref = ref.asImmutable();
    }
    switch(action.elementType) {
        case ProfileElementType.SectorEntry:
            viewProfile = viewProfile.viewSectorEntries(ref);
            break;
        case ProfileElementType.EducationEntry:
            viewProfile = viewProfile.viewEducationEntries(ref);
            break;
        case ProfileElementType.QualificationEntry:
            viewProfile = viewProfile.viewQualificationEntries(ref);
            break;
        case ProfileElementType.TrainingEntry:
            viewProfile = viewProfile.viewTrainingEntries(ref);
            break;
        case ProfileElementType.LanguageEntry:
            viewProfile = viewProfile.viewLanguageEntries(ref);
            break;
    }
    return state.viewProfiles(state.viewProfiles().set(viewProfile.id(), viewProfile));
}

function handleSortViewProfile(state: InternalDatabase, action: ViewProfileSortAction): InternalDatabase {
    return state;
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
        case ActionType.ShowProfile: {
            browserHistory.push('/app/profile');
            return state;
        }
        case ActionType.LogOutUser: {
            browserHistory.push('/');
            return state.profile(Profile.createDefault());
        }
        case ActionType.SaveViewProfile:
            return handleSaveViewProfiles(state, action as SaveViewProfileAction);
        case ActionType.DeleteViewProfile:
            return handleDeleteViewProfile(state, action as DeleteViewProfileAction);
        case ActionType.SelectViewProfile:
            return handleSelectViewProfile(state, action as SelectViewProfileAction);
        case ActionType.SetSelectedIndexes:
            return handleSetSelectedIndexes(state, action as SetSelectedIndexesAction);
        default:
            return state;
    }
}