import {doop} from 'doop';
import {ProfileEntryNotification} from './ProfileEntryNotification';
import {AdminNotificationReason, AdminNotificationReasonUtil} from './AdminNotificationReason';

/**
 * Everything that can be returned by the API. Includes multiple types of Admin notification discriminated by
 * their type.
 */
export interface APIAdminNotification {
    id: number;
    initials: string;
    reason: string;
    /**
     * Date String defining time of occurence
     */
    occurrence: string;
    type: string;
}

export class AdminNotification {
    public static readonly TP_SKILL: string = 'SkillNotification';
    public static readonly TP_PROFILE_UPDATE: string = 'ProfileUpdatedNotification';
    public static readonly TP_PROFILE_ENTRY: string = 'ProfileEntryNotification';

    private readonly _id: number;
    private readonly _initials: string;
    private readonly _reason: AdminNotificationReason;
    private readonly _occurrence: Date;
    private readonly _type: string;

    public id(): number {
        return this._id;
    };


    public initials() {
        return this._initials;
    };

    public reason() {
        return this._reason;
    };

    public occurrence() {
        return this._occurrence;
    };

    public type() {
        return this._type;
    };


    protected constructor(id: number,
                          initials: string,
                          reason: AdminNotificationReason,
                          occurrence: Date,
                          type: string) {
        this._id = id;
        this._initials = initials;
        this._reason = reason;
        this._occurrence = occurrence;
        this._type = type;
    }

    public static of(id: number, initials: string, reason: AdminNotificationReason, occurence: Date, type: string) {
        return new AdminNotification(id, initials, reason, occurence, type);
    }

    public static fromAPI(apiAdminNotification: APIAdminNotification): AdminNotification {
        return new AdminNotification(
            apiAdminNotification.id,
            apiAdminNotification.initials,
            AdminNotificationReasonUtil.fromString(apiAdminNotification.reason),
            new Date(apiAdminNotification.occurrence),
            apiAdminNotification.type);
    }

    public toApi(): APIAdminNotification {
        return {
            id: this.id(),
            initials: this.initials(),
            reason: AdminNotificationReason[this.reason()],
            occurrence: this.occurrence().toISOString(),
            type: this.type()
        };
    }
}
