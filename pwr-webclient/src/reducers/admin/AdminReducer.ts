import {AdminState} from '../../model/admin/AdminState';
import {AbstractAction, ChangeStringValueAction} from '../profile/database-actions';
import {isNullOrUndefined} from 'util';
import {
    AddSkillsToTreeAction,
    ChangeLoginStatusAction, NavigateAction, ReceiveAllConsultantsAction, ReceiveConsultantAction,
    ReceiveNotifcationsAction, ReceiveSkillCategoryAction,
    RequestStatusAction, SetSkillTreeAction
} from './admin-actions';
import {AdminNotification} from '../../model/admin/AdminNotification';
import {ActionType} from '../ActionType';
import {RequestStatus} from '../../Store';
import * as Immutable from 'immutable';
import {browserHistory} from 'react-router'
import {Paths} from '../../index';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {LoginStatus} from '../../model/LoginStatus';
import {SkillCategoryNode} from '../../model/admin/SkillTree';

export class AdminReducer {
    public static ReceiveNotifications(state: AdminState, action: ReceiveNotifcationsAction): AdminState {
        let notifications = action.notifications.map(an => AdminNotification.fromAPI(an)).sort((a, b) => {
            if(a.occurrence() > b.occurrence()) return -1;
            if(a.occurrence() == b.occurrence()) return 0;
            return 1;
        });
        return state.notifications(Immutable.List<AdminNotification>(notifications)).requestStatus(RequestStatus.Successful);
    }

    public static ReceiveTrashedNotifications(state: AdminState, action: ReceiveNotifcationsAction): AdminState {
        let notifications = action.notifications.map(an => AdminNotification.fromAPI(an));
        return state.trashedNotifications(Immutable.List<AdminNotification>(notifications)).requestStatus(RequestStatus.Successful);
    }

    public static RequestNotificationTrashing(state: AdminState, action: RequestStatusAction) {
        return state.requestStatus(action.requestStatus);
    }

    public static FailRequest(state: AdminState): AdminState {
        return state.requestStatus(RequestStatus.Failiure);
    }

    public static PendRequest(state: AdminState): AdminState {
        return state.requestStatus(RequestStatus.Pending);
    }

    public static NaviagateTo(state: AdminState, action: NavigateAction) {
        browserHistory.push(action.location);
        return state;
    }

    public static ChangeUsername(state: AdminState, action: ChangeStringValueAction) {
        return state.adminName(action.value);
    }

    public static ChangePassword(state: AdminState, action: ChangeStringValueAction) {
        return state.adminPass(action.value);
    }

    public static ChangeLoginStatus(state: AdminState, action: ChangeLoginStatusAction) {
        return state.loginStatus(action.status);
    }

    public static LogInAdmin(state: AdminState, action: AbstractAction): AdminState {
        browserHistory.push(Paths.ADMIN_INBOX);
        return state.loginStatus(LoginStatus.SUCCESS);
    }

    public static ReceiveAllConsultants(state: AdminState, action: ReceiveAllConsultantsAction): AdminState {
        let consultants = Immutable.Map<string, ConsultantInfo>();
        action.consultants.forEach((value, index, array) => {
            consultants = consultants.set(value.initials(), value);
        });
        return state.consultantsByInitials(consultants);
    }

    public static LogOutAdmin(state: AdminState): AdminState {
        browserHistory.push(Paths.APP_ROOT);
        return AdminState.createDefault();
    }

    public static ReceiveSingleConsultant(state: AdminState, receiveConsultantAction: ReceiveConsultantAction) {
        let consultants = state.consultantsByInitials().set(receiveConsultantAction.consultant.initials(), receiveConsultantAction.consultant);
        return state.consultantsByInitials(consultants);
    }

    public static ReceiveSkillCateogry(state: AdminState, receiveSkillCategoryAction: ReceiveSkillCategoryAction) {
        let tree = state.skillCategoryTreeRoot().addNodeAsChild(receiveSkillCategoryAction.skillCategory);
        return state.skillCategoryTreeRoot(tree);
    }

    public static SetSkillTree(state: AdminState, setSkillTreeAction: SetSkillTreeAction) {
        return state.skillCategoryTreeRoot(SkillCategoryNode.of(setSkillTreeAction.rootNode));
    }

    public static AddSkillsToTree(state: AdminState, addSkillsToTreeAction: AddSkillsToTreeAction) {
        let tree = state.skillCategoryTreeRoot();
        addSkillsToTreeAction.skills.forEach(skill => tree = tree.addNodeAsLeaf(skill));
        return state.skillCategoryTreeRoot(tree);
    }

    public static reduce(state : AdminState, action: AbstractAction) : AdminState {
        if(isNullOrUndefined(state)) {
            return AdminState.createDefault();
        }
        switch(action.type) {
            case ActionType.ReceiveNotifications:
                return AdminReducer.ReceiveNotifications(state, action as ReceiveNotifcationsAction);
            case ActionType.RequestTrashedNotifications:
            case ActionType.RequestNotifications:
                return AdminReducer.PendRequest(state);
            case ActionType.FailRequestTrashedNotifications:
            case ActionType.FailRequestNotifications:
                return AdminReducer.FailRequest(state);
            case ActionType.ReceiveTrashedNotifications:
                return AdminReducer.ReceiveTrashedNotifications(state, action as ReceiveNotifcationsAction);
            case ActionType.RequestNotificationTrashing:
                return AdminReducer.RequestNotificationTrashing(state, action as RequestStatusAction);
            case ActionType.AdminNavigate:
                return AdminReducer.NaviagateTo(state, action as NavigateAction);
            case ActionType.AdminRequestStatus:
                return state.requestStatus((action as RequestStatusAction).requestStatus);
            case ActionType.ChangeAdminLoginStatus:
                return AdminReducer.ChangeLoginStatus(state, action as ChangeLoginStatusAction);
            case ActionType.ChangeUsername:
                return AdminReducer.ChangeUsername(state, action as ChangeStringValueAction);
            case ActionType.ChangePassword:
                return AdminReducer.ChangePassword(state, action as ChangeStringValueAction);
            case ActionType.LogInAdmin:
                return AdminReducer.LogInAdmin(state, action);
            case ActionType.ReceiveAllConsultants:
                return AdminReducer.ReceiveAllConsultants(state, action as ReceiveAllConsultantsAction);
            case ActionType.LogOutAdmin:
                return AdminReducer.LogOutAdmin(state);
            case ActionType.ReceiveSingleConsultant:
                return AdminReducer.ReceiveSingleConsultant(state, action as ReceiveConsultantAction);
            case ActionType.ReceiveSkillCategory:
                return AdminReducer.ReceiveSkillCateogry(state, action as ReceiveSkillCategoryAction);
            case ActionType.SetSkillTree:
                return AdminReducer.SetSkillTree(state, action as SetSkillTreeAction);
            case ActionType.AddSkillsToTree:
                return AdminReducer.AddSkillsToTree(state, action as AddSkillsToTreeAction);
            default:
                return state;
        }
    }


}