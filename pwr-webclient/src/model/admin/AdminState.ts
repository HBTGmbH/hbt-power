import {doop} from 'doop';
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

@doop
export class AdminState {
    @doop
    public get profileEntryNotifications() {
        return doop<Immutable.List<ProfileEntryNotification>, this>();
    };

    @doop
    public get profileUpdateNotifications() {
        return doop<Immutable.List<AdminNotification>, this>();
    };

    @doop
    public get skillNotifications() {
        return doop<Immutable.List<SkillNotification>, this>();
    };

    @doop
    public get trashedNotifications() {
        return doop<Immutable.List<AdminNotification>, this>();
    };

    @doop
    public get requestStatus() {
        return doop<RequestStatus, this>();
    };

    @doop
    public get loginStatus() {
        return doop<LoginStatus, this>();
    };

    @doop
    public get consultantsByInitials() {
        return doop<Immutable.Map<string, ConsultantInfo>, this>();
    };

    // == Values below are used for the skill notification dialog == //

    @doop
    public get selectedSkillNotification() {
        return doop<SkillNotification, this>();
    };

    @doop
    public get skillNotificationEditStatus() {
        return doop<SkillNotificationEditStatus, this>();
    }

    @doop
    public get skillNotificationSelectedAction() {
        return doop<SkillNotificationAction, this>();
    }

    @doop
    public get skillNotificationError() {
        return doop<string, this>();
    }

    @doop
    public get isSkillNameEdited() {
        return doop<boolean, this>();
    };

    @doop
    public get templateUploadProgress() {
        return doop<number, this>();
    }

    @doop
    public get templateUploadPending() {
        return doop<boolean, this>();
    }

    @doop
    public get consultantInfo() {
        return doop<ConsultantInfoDTO[], this>();
    }

    private constructor(profileEntryNotifications: Immutable.List<ProfileEntryNotification>,
                        profileUpdateNotifications: Immutable.List<AdminNotification>,
                        skillNotifications: Immutable.List<SkillNotification>,
                        trashedNotifications: Immutable.List<AdminNotification>,
                        requestStatus: RequestStatus,
                        loginStatus: LoginStatus,
                        consultantsByInitials: Immutable.Map<string, ConsultantInfo>,
                        skillNotificationEditStatus: SkillNotificationEditStatus,
                        selectedSkillNotification: SkillNotification,
                        skillNotificationError: string,
                        skillNotificationSelectedAction: SkillNotificationAction,
                        isSkillNameEdited: boolean,
                        templateUploadProgress: number,
                        templateUploadPending: boolean,
                        consultantInfo: ConsultantInfoDTO[],
    ) {
        return this.profileEntryNotifications(profileEntryNotifications)
            .profileUpdateNotifications(profileUpdateNotifications)
            .skillNotifications(skillNotifications)
            .trashedNotifications(trashedNotifications)
            .requestStatus(requestStatus)
            .loginStatus(loginStatus)
            .consultantsByInitials(consultantsByInitials)
            .skillNotificationEditStatus(skillNotificationEditStatus)
            .selectedSkillNotification(selectedSkillNotification)
            .skillNotificationError(skillNotificationError)
            .skillNotificationSelectedAction(skillNotificationSelectedAction)
            .isSkillNameEdited(isSkillNameEdited)
            .templateUploadProgress(templateUploadProgress)
            .templateUploadPending(templateUploadPending)
            .consultantInfo(consultantInfo);
    }

    public static createDefault() {
        return new AdminState(Immutable.List<ProfileEntryNotification>(),
            Immutable.List<AdminNotification>(),
            Immutable.List<SkillNotification>(),
            Immutable.List<AdminNotification>(),
            RequestStatus.Inactive, LoginStatus.INITIALS,
            Immutable.Map<string, ConsultantInfo>(),
            SkillNotificationEditStatus.CLOSED, null, '', SkillNotificationAction.ACTION_OK, false, 0, false, []);
    }

    public findSkillNotification = (notificationId: number): SkillNotification => {
        return this.skillNotifications().find(notification => notification.adminNotification().id() === notificationId);
    };
}
