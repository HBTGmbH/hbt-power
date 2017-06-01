import {doop} from 'doop';
import * as Immutable from 'immutable';
import {AdminNotification} from './AdminNotification';
import {RequestStatus} from '../../Store';
import {LoginStatus} from '../LoginStatus';

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

    private constructor(notifications: Immutable.List<AdminNotification>,
                        trashedNotifications: Immutable.List<AdminNotification>,
                        requestStatus: RequestStatus,
                        loginStatus: LoginStatus,
                        adminName: string,
                        adminPass: string) {
        return this.notifications(notifications).trashedNotifications(trashedNotifications).requestStatus(requestStatus)
            .loginStatus(loginStatus).adminName(adminName).adminPass(adminPass);
    }

    public static createDefault() {
        return new AdminState(Immutable.List<AdminNotification>(),Immutable.List<AdminNotification>(),
            RequestStatus.Inactive, LoginStatus.INITIALS, "", "");
    }
}