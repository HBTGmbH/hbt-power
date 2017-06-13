import {APIRequestType, ProfileElementType, RequestStatus} from '../../Store';
import {error, isNullOrUndefined} from 'util';
import {
    AbstractAction, AddSkillAction,
    ChangeStringValueAction,
    ChangeViewProfileAction,
    CreateEntryAction,
    DeleteEntryAction,
    DeleteProjectAction,
    DeleteSkillAction,
    DeleteViewProfileAction,
    LoginAction,
    ReceiveAPIResponseAction,
    SaveEntryAction,
    SaveProjectAction,
    SaveViewProfileAction,
    SelectViewProfileAction,
    SetSelectedIndexesAction,
    SwapIndexAction,
    UpdateSkillRatingAction
} from './database-actions';
import {InternalDatabase} from '../../model/InternalDatabase';
import {Profile} from '../../model/Profile';
import {ProfileReducer} from './profile-reducer';
import {NameEntity} from '../../model/NameEntity';
import {Project} from '../../model/Project';
import {APINameEntity} from '../../model/APIProfile';
import {browserHistory} from 'react-router';
import {ActionType} from '../ActionType';
import {ViewElement} from '../../model/viewprofile/ViewElement';
import * as Immutable from 'immutable';
import {ViewProfile} from '../../model/viewprofile/ViewProfile';
import {APIViewProfile} from '../../model/viewprofile/APIViewProfile';
import {LoginStatus} from '../../model/LoginStatus';
import {COOKIE_INITIALS_EXPIRATION_TIME, COOKIE_INITIALS_NAME} from '../../model/PwrConstants';
import * as Cookies from 'js-cookie';

export class DatabaseReducer {
    private static AddAPINameEntities(names: Array<APINameEntity>, reference: Immutable.Map<string, NameEntity>): Immutable.Map<string, NameEntity> {
        let res: Immutable.Map<string, NameEntity> = reference;
        names.forEach(apiName => {
            let name: NameEntity = NameEntity.fromAPI(apiName);
            res = res.set(name.id(), name);
        });
        return res;
    }

    private static HandleChangeAbstract(state: InternalDatabase, action: ChangeStringValueAction): InternalDatabase {
        let newProfile: Profile = state.profile().description(action.value);
        return state.profile(newProfile);
    }

    private static HandleReceiveViewProfile(state: InternalDatabase, apiViewProfile:APIViewProfile): InternalDatabase {
        if(!isNullOrUndefined(apiViewProfile)) {
            let viewProfile: ViewProfile = ViewProfile.fromAPI(apiViewProfile);
            return state.viewProfiles(state.viewProfiles().set(viewProfile.id(), viewProfile));
        }
        return state;
    }

    private static DeleteEntry(state: InternalDatabase, action: DeleteEntryAction):InternalDatabase {
        let newProfile: Profile = ProfileReducer.reducerHandleRemoveEntry(state.profile(), action);
        return state.profile(newProfile);
    }

    private static CreateEntry(state: InternalDatabase, action: CreateEntryAction):InternalDatabase {
        let newProfile: Profile = ProfileReducer.reducerHandleCreateEntry(state.profile(), <CreateEntryAction> action);
        return state.profile(newProfile);
    }

    private static UpdateNameEntity(database: InternalDatabase, entity: NameEntity, type: ProfileElementType): InternalDatabase {
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


    private static SaveEntry(database: InternalDatabase, action: SaveEntryAction): InternalDatabase {
        if(!isNullOrUndefined(action.nameEntity) && action.nameEntity.isNew) {
            database = DatabaseReducer.UpdateNameEntity(database, action.nameEntity, action.entryType);
        }
        let profile: Profile = ProfileReducer.reducerUpdateEntry(database.profile(), action);
        return database.profile(profile);
    }

    private static DeleteProject(database: InternalDatabase, action: DeleteProjectAction): InternalDatabase {
        let idToRemove: string = (<DeleteProjectAction> action).id;
        let newProfile: Profile = database.profile();
        newProfile = newProfile.projects(newProfile.projects().remove(idToRemove));
        return database.profile(newProfile);
    }

    private static SaveProject(database: InternalDatabase, action: SaveProjectAction): InternalDatabase {
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
            endCustomer = NameEntity.createNew(action.state.clientACValue);
            database = database.companies(database.companies().set(endCustomer.id(), endCustomer));
        }
        project = project.endCustomerId(endCustomer.id());

        let profile: Profile = ProfileReducer.reducerHandleSaveProject(database.profile(), project, action.state.rawSkills);
        return database.profile(profile);
    }

    private static CreateProject(database: InternalDatabase): InternalDatabase{
        let newProfile: Profile = database.profile();
        let proj: Project = Project.createNew();
        newProfile = newProfile.projects(newProfile.projects().set(proj.id(), proj));
        return database.profile(newProfile);
    }

    private static UpdateSkillRating(database: InternalDatabase, action: UpdateSkillRatingAction): InternalDatabase {
        return database.profile(ProfileReducer.reducerHandleUpdateSkillRating(database.profile(), action));
    }

    private static DeleteSkill(database: InternalDatabase, action: DeleteSkillAction): InternalDatabase {
        return database.profile(ProfileReducer.reducerHandleDeleteSkill(database.profile(), action));
    }

    private static ApiRequestSuccessful(state: InternalDatabase, action: ReceiveAPIResponseAction): InternalDatabase {
        let newState: InternalDatabase;
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
            case APIRequestType.RequestCareers:
                newState = state.trainings(DatabaseReducer.AddAPINameEntities(action.payload, state.trainings()));
                break;
            case APIRequestType.RequestSectors:
                newState = state.sectors(DatabaseReducer.AddAPINameEntities(action.payload, state.sectors()));
                break;
            case APIRequestType.RequestProjectRoles:
                newState = state.projectRoles(DatabaseReducer.AddAPINameEntities(action.payload, state.projectRoles()));
                break;
            case APIRequestType.RequestCompanies:
                newState = state.companies(DatabaseReducer.AddAPINameEntities(action.payload, state.companies()));
                break;
            case APIRequestType.RequestCreateViewProfile:
                newState = DatabaseReducer.ReceiveViewProfile(state, action.payload);
                break;

        }
        return newState.APIRequestStatus(RequestStatus.Successful);
    }

    private static LogInUser(database: InternalDatabase, action: LoginAction): InternalDatabase {
        browserHistory.push('/app/home');
        Cookies.set(COOKIE_INITIALS_NAME, action.consultantInfo.initials(), {expires: COOKIE_INITIALS_EXPIRATION_TIME});
        database = database.loginStatus(LoginStatus.SUCCESS);
        return database.loggedInUser(action.consultantInfo); // TODO
    }

    private static ShowProfile(database: InternalDatabase): InternalDatabase {
        browserHistory.push('/app/profile');
        return database;
    }

    private static LogOutUser(database: InternalDatabase): InternalDatabase {
        browserHistory.push('/');
        Cookies.remove(COOKIE_INITIALS_NAME);
        database = database.viewProfiles(database.viewProfiles().clear());
        database = database.loggedInUser(null);
        return database.profile(Profile.createDefault());
    }

    private static SaveViewProfiles(state: InternalDatabase, action: SaveViewProfileAction): InternalDatabase {
        return state.viewProfiles(state.viewProfiles().set(action.viewProfile.id(), action.viewProfile));
    }

    private static DeleteViewProfile(state: InternalDatabase, action: DeleteViewProfileAction): InternalDatabase {
        return state.viewProfiles(state.viewProfiles().remove(action.id));
    }

    private static SelectViewProfile(state: InternalDatabase, action: SelectViewProfileAction): InternalDatabase {
        browserHistory.push("/app/view");
        return state.activeViewProfileId(action.id);
    }

    private static SetSelectedIndexes(state: InternalDatabase, action: SetSelectedIndexesAction): InternalDatabase {
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

    private static SwapListIndexes(list: Immutable.List<ViewElement>, index1: number, index2: number): Immutable.List<ViewElement> {
        let v1 = list.get(index1);
        let v2 = list.get(index2);
        list = list.set(index2, v1);
        list = list.set(index1, v2);
        return list;
    }

    private static SwapIndexes(state: InternalDatabase, action: SwapIndexAction): InternalDatabase {
        let viewProfile = state.viewProfiles().get(action.viewProfileId);
        let list;
        switch(action.elementType) {
            case ProfileElementType.Project:
                viewProfile = viewProfile.viewProjects(DatabaseReducer.SwapListIndexes(viewProfile.viewProjects(), action.index1, action.index2));
                break;
            case ProfileElementType.EducationEntry:
                viewProfile = viewProfile.viewEducationEntries(DatabaseReducer.SwapListIndexes(viewProfile.viewEducationEntries(), action.index1, action.index2));
                break;
            case ProfileElementType.SectorEntry:
                viewProfile = viewProfile.viewSectorEntries(DatabaseReducer.SwapListIndexes(viewProfile.viewSectorEntries(), action.index1, action.index2));
                break;
            case ProfileElementType.QualificationEntry:
                viewProfile = viewProfile.viewQualificationEntries(DatabaseReducer.SwapListIndexes(viewProfile.viewQualificationEntries(), action.index1, action.index2));
                break;
            case ProfileElementType.TrainingEntry:
                viewProfile = viewProfile.viewTrainingEntries(DatabaseReducer.SwapListIndexes(viewProfile.viewTrainingEntries(), action.index1, action.index2));
                break;
            case ProfileElementType.LanguageEntry:
                viewProfile = viewProfile.viewLanguageEntries(DatabaseReducer.SwapListIndexes(viewProfile.viewLanguageEntries(), action.index1, action.index2));
                break;
        }
        return state.viewProfiles(state.viewProfiles().set(viewProfile.id(), viewProfile));
    }

    private static ChangeViewProfileName(state: InternalDatabase, action: ChangeViewProfileAction): InternalDatabase {
        let vp: ViewProfile = state.viewProfiles().get(action.viewProfileId).name(action.val);
        return state.viewProfiles(state.viewProfiles().set(vp.id(), vp));
    }

    private static ChangeViewProfileDescription(state: InternalDatabase, action: ChangeViewProfileAction): InternalDatabase {
        let vp: ViewProfile = state.viewProfiles().get(action.viewProfileId).description(action.val);
        return state.viewProfiles(state.viewProfiles().set(vp.id(), vp));
    }

    private static ReceiveViewProfile(state: InternalDatabase, apiViewProfile:APIViewProfile): InternalDatabase {
        if(!isNullOrUndefined(apiViewProfile)) {
            let viewProfile: ViewProfile = ViewProfile.fromAPI(apiViewProfile);
            return state.viewProfiles(state.viewProfiles().set(viewProfile.id(), viewProfile));
        }
        return state;
    }

    private static AddSkill(state: InternalDatabase, action: AddSkillAction): InternalDatabase {
        let profile = ProfileReducer.reducerHandleAddSkill(state.profile(), action);
        return state.profile(profile);
    }


    public static Reduce(state : InternalDatabase, action: AbstractAction) : InternalDatabase {
        if(isNullOrUndefined(state)) {
            state = InternalDatabase.createWithDefaults();
        }
        console.log('DatabaseReducer called for action type ' + ActionType[action.type]);
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
            case ActionType.ShowProfile: return DatabaseReducer.ShowProfile(state);
            case ActionType.LogOutUser: return DatabaseReducer.LogOutUser(state);
            case ActionType.SaveViewProfile: return DatabaseReducer.SaveViewProfiles(state, action as SaveViewProfileAction);
            case ActionType.DeleteViewProfile: return DatabaseReducer.DeleteViewProfile(state, action as DeleteViewProfileAction);
            case ActionType.SelectViewProfile: return DatabaseReducer.SelectViewProfile(state, action as SelectViewProfileAction);
            case ActionType.SetSelectedIndexes: return DatabaseReducer.SetSelectedIndexes(state, action as SetSelectedIndexesAction);
            case ActionType.APIRequestSuccess_NoContent: return state.APIRequestStatus(RequestStatus.Successful);
            case ActionType.UserLoginFailed: return state.loginStatus(LoginStatus.REJECTED);
            case ActionType.SwapIndex:return DatabaseReducer.SwapIndexes(state, action as SwapIndexAction);
            case ActionType.ChangeViewProfileName: return DatabaseReducer.ChangeViewProfileName(state, action as ChangeViewProfileAction);
            case ActionType.ChangeViewProfileDescription: return DatabaseReducer.ChangeViewProfileDescription(state, action as ChangeViewProfileAction);
            case ActionType.AddSkill: return DatabaseReducer.AddSkill(state, action as AddSkillAction);
            default:
                return state;
        }
    }
}
