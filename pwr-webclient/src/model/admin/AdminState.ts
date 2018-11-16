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
import {AxiosRequestConfig} from 'axios';

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
    public get adminName() {
        return doop<string, this>();
    };

    @doop
    public get adminPass() {
        return doop<string, this>();
    };

    @doop
    public get consultantsByInitials() {
        return doop<Immutable.Map<string, ConsultantInfo>, this>();
    };

    // == Values below are used for the skill notification dialog == //

    /**
     * Skill notification that is selected for resolving.
     * @returns {Doop<SkillNotification, this>}
     */
    @doop
    public get selectedSkillNotification() {
        return doop<SkillNotification, this>();
    };

    @doop
    public get skillNotificationEditStatus() {
        return doop<SkillNotificationEditStatus, this>();
    }

    /**
     * Selected action for the selected skill notification.
     * @returns {Doop<SkillNotificationAction, this>}
     */
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

    private constructor(profileEntryNotifications: Immutable.List<ProfileEntryNotification>,
                        profileUpdateNotifications: Immutable.List<AdminNotification>,
                        skillNotifications: Immutable.List<SkillNotification>,
                        trashedNotifications: Immutable.List<AdminNotification>,
                        requestStatus: RequestStatus,
                        loginStatus: LoginStatus,
                        adminName: string,
                        adminPass: string,
                        consultantsByInitials: Immutable.Map<string, ConsultantInfo>,
                        skillInfo: string,
                        skillNotificationEditStatus: SkillNotificationEditStatus,
                        selectedSkillNotification: SkillNotification,
                        skillNotificationError: string,
                        skillNotificationSelectedAction: SkillNotificationAction,
                        isSkillNameEdited: boolean
    ) {
        return this.profileEntryNotifications(profileEntryNotifications)
            .profileUpdateNotifications(profileUpdateNotifications)
            .skillNotifications(skillNotifications)
            .trashedNotifications(trashedNotifications).requestStatus(requestStatus)
            .loginStatus(loginStatus).adminName(adminName).adminPass(adminPass).consultantsByInitials(consultantsByInitials)
            .skillNotificationEditStatus(skillNotificationEditStatus)
            .selectedSkillNotification(selectedSkillNotification)
            .skillNotificationError(skillNotificationError)
            .skillNotificationSelectedAction(skillNotificationSelectedAction)
            .isSkillNameEdited(isSkillNameEdited);
    }

    public static createDefault() {
        return new AdminState(Immutable.List<ProfileEntryNotification>(),
            Immutable.List<AdminNotification>(),
            Immutable.List<SkillNotification>(),
            Immutable.List<AdminNotification>(),
            RequestStatus.Inactive, LoginStatus.INITIALS, '', '', Immutable.Map<string, ConsultantInfo>(),
            '',
            SkillNotificationEditStatus.CLOSED, null, '', SkillNotificationAction.ACTION_OK, false);
    }

    public adminAuthConfig(): AxiosRequestConfig {
        return {
            auth: {
                username: this.adminName(),
                password: this.adminPass()
            }
        };
    }
}