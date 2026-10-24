import {AdminState, emptyAdminState} from '../../model/admin/AdminState';
import {
    ChangeLoginStatusAction,
    ChangeRequestStatusAction,
    LoadConsultantInfoSuccess,
    ReceiveAllConsultantsAction,
    ReceiveConsultantAction
} from './admin-actions';
import {ActionType} from '../ActionType';
import * as Immutable from 'immutable';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {LoginStatus} from '../../model/LoginStatus';
import {AbstractAction, ChangeBoolValueAction, ChangeNumberValueAction} from '../BaseActions';

export class AdminReducer {

    public static ChangeLoginStatus(state: AdminState, action: ChangeLoginStatusAction): AdminState {
        return {
            ...state,
            loginStatus: action.status
        }
    }

    public static LogInAdmin(state: AdminState): AdminState {
        return {
            ...state,
            loginStatus: LoginStatus.SUCCESS
        }
    }

    public static ReceiveAllConsultants(state: AdminState, action: ReceiveAllConsultantsAction): AdminState {
        let consultants = Immutable.Map<string, ConsultantInfo>();
        action.consultants.forEach((value) => {
            consultants = consultants.set(value.initials(), value);
        });
        return {
            ...state,
            consultantsByInitials: consultants
        }
    }

    public static LogOutAdmin(): AdminState {
        return emptyAdminState();
    }

    public static ReceiveSingleConsultant(state: AdminState, receiveConsultantAction: ReceiveConsultantAction): AdminState {
        let consultants = state.consultantsByInitials.set(receiveConsultantAction.consultant.initials(), receiveConsultantAction.consultant);
        return {
            ...state,
            consultantsByInitials: consultants
        }
    }

    public static reduce(state = emptyAdminState(), action: AbstractAction): AdminState {
        switch (action.type) {
            case ActionType.AdminRequestStatus:
                return {
                    ...state,
                    requestStatus: (action as ChangeRequestStatusAction).requestStatus
                }
            case ActionType.ChangeAdminLoginStatus:
                return AdminReducer.ChangeLoginStatus(state, action as ChangeLoginStatusAction);
            case ActionType.LogInAdmin:
                return AdminReducer.LogInAdmin(state);
            case ActionType.ReceiveAllConsultants:
                return AdminReducer.ReceiveAllConsultants(state, action as ReceiveAllConsultantsAction);
            case ActionType.LogOutAdmin:
                return AdminReducer.LogOutAdmin();
            case ActionType.ReceiveSingleConsultant:
                return AdminReducer.ReceiveSingleConsultant(state, action as ReceiveConsultantAction);
            case ActionType.SetReportUploadProgress: {
                let act = action as ChangeNumberValueAction;
                return {
                    ...state,
                    templateUploadProgress: act.value
                }
            }
            case ActionType.SetReportUploadPending: {
                let act = action as ChangeBoolValueAction;
                return {
                    ...state,
                    templateUploadPending: act.value
                }
            }
            case ActionType.LoadConsultantInfoSuccess: {
                let act = action as LoadConsultantInfoSuccess;
                return {
                    ...state,
                    consultantInfo: act.consultantInfo
                }
            }
            default:
                return state;
        }
    }

}
