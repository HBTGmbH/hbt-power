import {doop} from 'doop';
import * as Immutable from 'immutable';
import {AdminNotification} from './AdminNotification';
import {RequestStatus} from '../../Store';

@doop
export class AdminState {
    @doop
    public get notifications() {return doop<Immutable.List<AdminNotification>, this>()};

    @doop
    public get trashedNotifications() {return doop<Immutable.List<AdminNotification>, this>()};

    @doop
    public get requestStatus() {return doop<RequestStatus, this>()};


    private constructor(notifications: Immutable.List<AdminNotification>,
                        trashedNotifications: Immutable.List<AdminNotification>,
                        requestStatus: RequestStatus) {
        return this.notifications(notifications).trashedNotifications(trashedNotifications).requestStatus(requestStatus);
    }

    public static createDefault() {
        return new AdminState(Immutable.List<AdminNotification>(),Immutable.List<AdminNotification>(), RequestStatus.Inactive);
    }
}