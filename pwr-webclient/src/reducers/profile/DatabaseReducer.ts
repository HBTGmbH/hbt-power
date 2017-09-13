import {APIRequestType, ProfileElementType, RequestStatus} from '../../Store';
import {error, isNullOrUndefined} from 'util';
import {
    AbstractAction,
    AddSkillAction,
    ChangeStringValueAction,
    CreateEntryAction,
    DeleteEntryAction,
    DeleteProjectAction,
    DeleteSkillAction,
    LoginAction,
    ReceiveAPIResponseAction,
    SaveEntryAction,
    SaveProjectAction,
    UpdateSkillRatingAction
} from './database-actions';
import {ProfileStore} from '../../model/ProfileStore';
import {Profile} from '../../model/Profile';
import {ProfileReducer} from './profile-reducer';
import {NameEntity} from '../../model/NameEntity';
import {Project} from '../../model/Project';
import {APINameEntity} from '../../model/APIProfile';
import {ActionType} from '../ActionType';
import * as Immutable from 'immutable';
import {LoginStatus} from '../../model/LoginStatus';
import {ExportDocument} from '../../model/ExportDocument';
import {ConsultantInfo} from '../../model/ConsultantInfo';

export class DatabaseReducer {
    private static AddAPINameEntities(names: Array<APINameEntity>, reference: Immutable.Map<string, NameEntity>): Immutable.Map<string, NameEntity> {
        let res: Immutable.Map<string, NameEntity> = reference;
        names.forEach(apiName => {
            let name: NameEntity = NameEntity.fromAPI(apiName);
            res = res.set(name.id(), name);
        });
        return res;
    }

    private static HandleChangeAbstract(state: ProfileStore, action: ChangeStringValueAction): ProfileStore {
        let newProfile: Profile = state.profile().description(action.value);
        return state.profile(newProfile);
    }


    private static DeleteEntry(state: ProfileStore, action: DeleteEntryAction):ProfileStore {
        let newProfile: Profile = ProfileReducer.reducerHandleRemoveEntry(state.profile(), action);
        return state.profile(newProfile);
    }

    private static CreateEntry(state: ProfileStore, action: CreateEntryAction):ProfileStore {
        let newProfile: Profile = ProfileReducer.reducerHandleCreateEntry(state.profile(), <CreateEntryAction> action);
        return state.profile(newProfile);
    }

    private static UpdateNameEntity(database: ProfileStore, entity: NameEntity, type: ProfileElementType): ProfileStore {
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
            case ProfileElementType.CareerEntry:
                return database.careers(database.careers().set(entity.id(), entity));
            case ProfileElementType.KeySkill:
                return database.keySkills(database.keySkills().set(entity.id(), entity));
            default:
                throw error("Unknown switch value " + ProfileElementType[type]);
        }
    }


    private static SaveEntry(database: ProfileStore, action: SaveEntryAction): ProfileStore {
        if(!isNullOrUndefined(action.nameEntity) && action.nameEntity.isNew) {
            database = DatabaseReducer.UpdateNameEntity(database, action.nameEntity, action.entryType);
        }
        let profile: Profile = ProfileReducer.reducerUpdateEntry(database.profile(), action);
        return database.profile(profile);
    }

    private static DeleteProject(database: ProfileStore, action: DeleteProjectAction): ProfileStore {
        let idToRemove: string = (<DeleteProjectAction> action).id;
        let newProfile: Profile = database.profile();
        newProfile = newProfile.projects(newProfile.projects().remove(idToRemove));
        return database.profile(newProfile);
    }

    private static SaveProject(database: ProfileStore, action: SaveProjectAction): ProfileStore {
        // project with role IDs cleared.
        let project: Project = action.state.project.roleIds(action.state.project.roleIds().clear());
        project = project.roleIds(project.roleIds().clear());
        action.state.roles.forEach(role => {
            let projectRole: NameEntity = ProfileStore.findNameEntityByName(role, database.projectRoles());
            if(isNullOrUndefined(projectRole)) {
                projectRole = NameEntity.createNew(role);
                database = database.projectRoles(database.projectRoles().set(projectRole.id(), projectRole));
            }
            project = project.roleIds(project.roleIds().push(projectRole.id()));
        });

        // Fix end customer and broker
        let broker: NameEntity = ProfileStore.findNameEntityByName(action.state.brokerACValue, database.companies());
        if(isNullOrUndefined(broker)) {
            broker = NameEntity.createNew(action.state.brokerACValue);
            database = database.companies(database.companies().set(broker.id(), broker));
        }
        project = project.brokerId(broker.id());

        // End customer
        let endCustomer: NameEntity = ProfileStore.findNameEntityByName(action.state.clientACValue, database.companies());
        if(isNullOrUndefined(endCustomer)) {
            endCustomer = NameEntity.createNew(action.state.clientACValue);
            database = database.companies(database.companies().set(endCustomer.id(), endCustomer));
        }
        project = project.endCustomerId(endCustomer.id());

        let profile: Profile = ProfileReducer.reducerHandleSaveProject(database.profile(), project, action.state.rawSkills);
        return database.profile(profile);
    }

    private static CreateProject(database: ProfileStore): ProfileStore{
        let newProfile: Profile = database.profile();
        let proj: Project = Project.createNew();
        newProfile = newProfile.projects(newProfile.projects().set(proj.id(), proj));
        return database.profile(newProfile);
    }

    private static UpdateSkillRating(database: ProfileStore, action: UpdateSkillRatingAction): ProfileStore {
        return database.profile(ProfileReducer.reducerHandleUpdateSkillRating(database.profile(), action));
    }

    private static DeleteSkill(database: ProfileStore, action: DeleteSkillAction): ProfileStore {
        return database.profile(ProfileReducer.reducerHandleDeleteSkill(database.profile(), action));
    }

    private static ApiRequestSuccessful(state: ProfileStore, action: ReceiveAPIResponseAction): ProfileStore {
        let newState: ProfileStore;
        switch(action.requestType) {
            case APIRequestType.RequestLanguages:
                newState = state.languages(DatabaseReducer.AddAPINameEntities(action.payload, state.languages()));
                break;
            case APIRequestType.RequestProfile:
                newState = state.parseProfile(action.payload);
                break;
            case APIRequestType.SaveProfile:
                newState = state.parseProfile(action.payload.profile);
                break;
            case APIRequestType.RequestEducations:
                newState = state.educations(DatabaseReducer.AddAPINameEntities(action.payload, state.educations()));
                break;
            case APIRequestType.RequestQualifications:
                newState = state.qualifications(DatabaseReducer.AddAPINameEntities(action.payload, state.qualifications()));
                break;
            case APIRequestType.RequestTrainings:
                newState = state.trainings(DatabaseReducer.AddAPINameEntities(action.payload, state.trainings()));
                break;
            case APIRequestType.RequestSectors:
                newState = state.sectors(DatabaseReducer.AddAPINameEntities(action.payload, state.sectors()));
                break;
            case APIRequestType.RequestKeySkills:
                newState = state.keySkills(DatabaseReducer.AddAPINameEntities(action.payload, state.keySkills()));
                break;
            case APIRequestType.RequestCareers:
                newState = state.careers(DatabaseReducer.AddAPINameEntities(action.payload, state.careers()));
                break;
            case APIRequestType.RequestProjectRoles:
                newState = state.projectRoles(DatabaseReducer.AddAPINameEntities(action.payload, state.projectRoles()));
                break;
            case APIRequestType.RequestCompanies:
                newState = state.companies(DatabaseReducer.AddAPINameEntities(action.payload, state.companies()));
                break;
            case APIRequestType.RequestExportDocs:
                newState = state.exportDocuments(Immutable.List<ExportDocument>(action.payload));
                break;
            case APIRequestType.RequestSkillNames:
                newState = state.currentlyUsedSkillNames(Immutable.Set<string>(action.payload));
                break;
        }
        return newState.APIRequestStatus(RequestStatus.Successful);
    }

    private static LogInUser(database: ProfileStore, action: LoginAction): ProfileStore {
        database = database.loginStatus(LoginStatus.SUCCESS);
        return database.loggedInUser(action.consultantInfo);
    }

    private static LogOutUser(database: ProfileStore): ProfileStore {
        database = database.loggedInUser(ConsultantInfo.empty());
        return database.profile(Profile.createDefault());
    }

    private static AddSkill(state: ProfileStore, action: AddSkillAction): ProfileStore {
        let profile = ProfileReducer.reducerHandleAddSkill(state.profile(), action);
        return state.profile(profile);
    }

    public static SetUserInitials(state: ProfileStore, action: ChangeStringValueAction): ProfileStore {
        let loggedInUser = state.loggedInUser().initials(action.value);
        return state.loggedInUser(loggedInUser);
    }

    public static Reduce(state : ProfileStore, action: AbstractAction) : ProfileStore {
        if(isNullOrUndefined(state)) {
            state = ProfileStore.createWithDefaults();
        }
        console.debug('DatabaseReducer called for action type ' + ActionType[action.type]);
        switch(action.type) {
            case ActionType.ChangeAbstract: return DatabaseReducer.HandleChangeAbstract(state, action as ChangeStringValueAction);
            case ActionType.DeleteEntry: return DatabaseReducer.DeleteEntry(state, action as DeleteEntryAction);
            case ActionType.CreateEntry: return DatabaseReducer.CreateEntry(state, action as CreateEntryAction);
            case ActionType.SaveEntry: return DatabaseReducer.SaveEntry(state, action as SaveEntryAction);
            case ActionType.SaveProject: return DatabaseReducer.SaveProject(state, action as SaveProjectAction);
            case ActionType.DeleteProject: return DatabaseReducer.DeleteProject(state, action as DeleteProjectAction);
            case ActionType.CreateProject: return DatabaseReducer.CreateProject(state);
            case ActionType.UpdateSkillRating: return DatabaseReducer.UpdateSkillRating(state, action as UpdateSkillRatingAction);
            case ActionType.DeleteSkill: return DatabaseReducer.DeleteSkill(state, action as DeleteSkillAction);
            case ActionType.APIRequestPending: return state.APIRequestStatus(RequestStatus.Pending);
            case ActionType.APIRequestFail: return state.APIRequestStatus(RequestStatus.Failiure);
            case ActionType.APIRequestSuccess: return DatabaseReducer.ApiRequestSuccessful(state, action as ReceiveAPIResponseAction);
            case ActionType.LogInUser: return DatabaseReducer.LogInUser(state, action as LoginAction);
            case ActionType.LogOutUser: return DatabaseReducer.LogOutUser(state);
            case ActionType.APIRequestSuccess_NoContent: return state.APIRequestStatus(RequestStatus.Successful);
            case ActionType.UserLoginFailed: return state.loginStatus(LoginStatus.REJECTED);
            case ActionType.AddSkill: return DatabaseReducer.AddSkill(state, action as AddSkillAction);
            case ActionType.SetUserInitials: return DatabaseReducer.SetUserInitials(state, action as ChangeStringValueAction);
            default:
                return state;
        }
    }


}
