import * as Immutable from 'immutable';
import {AdminNotification} from './AdminNotification';
import {RequestStatus} from '../../Store';
import {LoginStatus} from '../LoginStatus';
import {ConsultantInfo} from '../ConsultantInfo';
import {ProfileEntryNotification} from './ProfileEntryNotification';
import {SkillNotification} from './SkillNotification';
import {SkillNotificationEditStatus} from './SkillNotificationEditStatus';
import {SkillNotificationAction} from './SkillNotificationAction';
import {ConsultantInfoDTO} from '../ConsultantInfoDTO';

export interface AdminState {
    profileEntryNotifications: Immutable.List<ProfileEntryNotification>;
    profileUpdateNotifications: Immutable.List<AdminNotification>;
    skillNotifications: Immutable.List<SkillNotification>;
    trashedNotifications: Immutable.List<AdminNotification>;
    requestStatus: RequestStatus;
    loginStatus: LoginStatus;
    consultantsByInitials: Immutable.Map<string, ConsultantInfo>;
    // == Values below are used for the skill notification dialog == //

    selectedSkillNotification: SkillNotification;
    skillNotificationEditStatus: SkillNotificationEditStatus;
    skillNotificationSelectedAction: SkillNotificationAction;
    skillNotificationError: string;
    isSkillNameEdited: boolean;
    templateUploadProgress: number;
    templateUploadPending: boolean;
    consultantInfo: ConsultantInfoDTO[];
}

export function emptyAdminState(): AdminState {
    return {
        consultantInfo: [],
        isSkillNameEdited: false,
        consultantsByInitials: Immutable.Map<string, ConsultantInfo>(),
        loginStatus: LoginStatus.INITIALS,
        profileEntryNotifications: Immutable.List<ProfileEntryNotification>(),
        profileUpdateNotifications: Immutable.List<AdminNotification>(),
        skillNotifications: Immutable.List<SkillNotification>(),
        trashedNotifications: Immutable.List<AdminNotification>(),
        requestStatus: RequestStatus.Inactive,
        selectedSkillNotification: null,
        skillNotificationEditStatus: SkillNotificationEditStatus.CLOSED,
        skillNotificationError: '',
        skillNotificationSelectedAction: SkillNotificationAction.ACTION_OK,
        templateUploadPending: false,
        templateUploadProgress: 0
    }
}

export function findSkillNotification(notificationId: number, state: AdminState): SkillNotification {
    return state.skillNotifications.find(notification => notification.adminNotification().id() === notificationId);
}
