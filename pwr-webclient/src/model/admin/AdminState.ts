import {doop} from 'doop';
import * as Immutable from 'immutable';
import {AdminNotification} from './AdminNotification';
import {RequestStatus} from '../../Store';
import {LoginStatus} from '../LoginStatus';
import {ConsultantInfo} from '../ConsultantInfo';

@doop
export class AdminState {
    @doop
    public get notifications() {return doop<Immutable.List<AdminNotification>, this>()};

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


    private constructor(notifications: Immutable.List<AdminNotification>,
                        trashedNotifications: Immutable.List<AdminNotification>,
                        requestStatus: RequestStatus,
                        loginStatus: LoginStatus,
                        adminName: string,
                        adminPass: string,
                        consultantsByInitials: Immutable.Map<string, ConsultantInfo>) {
        return this.notifications(notifications).trashedNotifications(trashedNotifications).requestStatus(requestStatus)
            .loginStatus(loginStatus).adminName(adminName).adminPass(adminPass).consultantsByInitials(consultantsByInitials);
    }

    public static createDefault() {
        return new AdminState(Immutable.List<AdminNotification>(),Immutable.List<AdminNotification>(),
            RequestStatus.Inactive, LoginStatus.INITIALS, "", "", Immutable.Map<string, ConsultantInfo>());
    }
}