import {doop} from 'doop';
import * as Immutable from 'immutable';
import {AdminNotification} from './AdminNotification';
import {RequestStatus} from '../../Store';
import {LoginStatus} from '../LoginStatus';
import {ConsultantInfo} from '../ConsultantInfo';
import {ProfileEntryNotification} from './ProfileEntryNotification';
import {SkillNotification} from './SkillNotification';

@doop
export class AdminState {
    @doop
    public get profileEntryNotifications() {return doop<Immutable.List<ProfileEntryNotification>, this>()};

    @doop
    public get profileUpdateNotifications() {return doop<Immutable.List<AdminNotification>, this>()};

    @doop
    public get skillNotifications() {return doop<Immutable.List<SkillNotification>, this>()};

    @doop
    public get trashedNotifications() {return doop<Immutable.List<AdminNotification>, this>()};

    @doop
    public get requestStatus() {return doop<RequestStatus, this>()};

    @doop
    public get loginStatus() {return doop<LoginStatus, this>()};

    @doop
    public get adminName() {return doop<string, this>()};

    @doop
    public get adminPass() {return doop<string, this>()};

    @doop
    public get consultantsByInitials() {return doop<Immutable.Map<string, ConsultantInfo>, this>()};

    private constructor(profileEntryNotifications: Immutable.List<ProfileEntryNotification>,
                        profileUpdateNotifications: Immutable.List<AdminNotification>,
                        skillNotifications: Immutable.List<SkillNotification>,
                        trashedNotifications: Immutable.List<AdminNotification>,
                        requestStatus: RequestStatus,
                        loginStatus: LoginStatus,
                        adminName: string,
                        adminPass: string,
                        consultantsByInitials: Immutable.Map<string, ConsultantInfo>,
    ) {
        return this.profileEntryNotifications(profileEntryNotifications)
            .profileUpdateNotifications(profileUpdateNotifications)
            .skillNotifications(skillNotifications)
            .trashedNotifications(trashedNotifications).requestStatus(requestStatus)
            .loginStatus(loginStatus).adminName(adminName).adminPass(adminPass).consultantsByInitials(consultantsByInitials);
    }

    public static createDefault() {
        return new AdminState(Immutable.List<ProfileEntryNotification>(),
            Immutable.List<AdminNotification>(),
            Immutable.List<SkillNotification>(),
            Immutable.List<AdminNotification>(),
            RequestStatus.Inactive, LoginStatus.INITIALS, "", "", Immutable.Map<string, ConsultantInfo>());
    }
}