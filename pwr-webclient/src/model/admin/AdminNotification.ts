import {doop} from 'doop';
import {ProfileEntryNotification} from './ProfileEntryNotification';
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

@doop
export class AdminNotification {
    public static readonly TP_SKILL: string = "SkillNotification";
    public static readonly TP_PROFILE_UPDATE: string = "ProfileUpdatedNotification";
    public static readonly TP_PROFILE_ENTRY: string = "ProfileEntryNotification";

    @doop public get id() {return doop<number, this>()};
    @doop public get initials() {return doop<string, this>()};
    @doop public get reason()  {return doop<string, this>()};

    /**
     * The date on which the notification occured.
     * @returns {Doop<Date, this>}
     */
    @doop public get occurrence() {return doop<Date, this>()};
    @doop public get type() {return doop<string, this>()};


    protected constructor(id: number,
                        initials: string,
                        reason: string,
                        occurrence: Date,
                        type: string,) {
        return this.id(id)
            .initials(initials)
            .reason(reason)
            .occurrence(occurrence)
            .type(type);
    }

    public static of(id: number, initials: string, reason: string, occurence: Date, type: string) {
        return new AdminNotification(id, initials, reason, occurence, type);
    }

    public static fromAPI(apiAdminNotification: APIAdminNotification): AdminNotification {
        return new AdminNotification(apiAdminNotification.id, apiAdminNotification.initials, apiAdminNotification.reason, new Date(apiAdminNotification.occurrence), apiAdminNotification.type);
    }

    public toApi() : APIAdminNotification {
        return {
            id: this.id(),
            initials: this.initials(),
            reason: this.reason(),
            occurrence: this.occurrence().toISOString(),
            type: this.type()
        }
    }
}