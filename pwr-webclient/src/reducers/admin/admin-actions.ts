
import {AbstractAction} from '../profile/database-actions';
import {AdminNotification, APIAdminNotification} from '../../model/admin/AdminNotification';
import {RequestStatus} from '../../Store';
import {LoginStatus} from '../../model/LoginStatus';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {APISkillCategory, APISkillServiceSkill, SkillCategoryNode} from '../../model/admin/SkillTree';

/**
 * Invokes receiving the given array of {@link APIAdminNotification} and subsequent parsing to {@link AdminNotification}
 */
export interface ReceiveNotifcationsAction extends AbstractAction {
    notifications: Array<APIAdminNotification>;
}

export interface RequestStatusAction extends AbstractAction {
    requestStatus: RequestStatus;
}

export interface NavigateAction extends AbstractAction {
    location: string;
}

export interface ChangeLoginStatusAction extends AbstractAction {
    status: LoginStatus;
}

export interface ReceiveAllConsultantsAction extends AbstractAction {
    consultants: Array<ConsultantInfo>;
}

export interface ReceiveConsultantAction extends AbstractAction {
    consultant: ConsultantInfo;
}

export interface ReceiveSkillCategoryAction extends AbstractAction {
    skillCategory: APISkillCategory;
}

export interface SetSkillTreeAction extends AbstractAction {
    rootNode: SkillCategoryNode;
}

export interface AddSkillsToTreeAction extends AbstractAction {
    skills: Array<APISkillServiceSkill>;
}