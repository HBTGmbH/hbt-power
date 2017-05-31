import {doop} from 'doop';
import {APINameEntity} from '../APIProfile';
import {NameEntity} from '../NameEntity';
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
    // == Everything below this is message specific == //
    nameEntity: APINameEntity;
    profileEntryId: number;
}

@doop
export class AdminNotification {
    @doop public get id() {return doop<number, this>()};
    @doop public get initials() {return doop<string, this>()};
    @doop public get reason()  {return doop<string, this>()};
    @doop public get occurrence() {return doop<Date, this>()};
    @doop public get type() {return doop<string, this>()};
    @doop public get profileEntryId() {return doop<number, this>()}
    @doop public get nameEntity() {return doop<NameEntity, this>()};

    private constructor(id: number,
                        initials: string,
                        reason: string,
                        occurrence: Date,
                        type: string,
                        profileEntryId: number,
                        nameEntity: NameEntity) {
        return this.id(id)
            .initials(initials)
            .reason(reason)
            .occurrence(occurrence)
            .type(type)
            .profileEntryId(profileEntryId)
            .nameEntity(nameEntity);
    }

    public static fromAPI(apiAdminNotification: APIAdminNotification) {
        return new AdminNotification(
            Number(apiAdminNotification.id),
            apiAdminNotification.initials,
            apiAdminNotification.reason,
            new Date(apiAdminNotification.occurrence),
            apiAdminNotification.type,
            apiAdminNotification.profileEntryId,
            NameEntity.fromAPI(apiAdminNotification.nameEntity)
        )
    }

    public toApi() : APIAdminNotification {
        return {
            id: this.id(),
            initials: this.initials(),
            reason: this.reason(),
            occurrence: this.occurrence().toISOString(),
            type: this.type(),
            nameEntity: this.nameEntity().toAPI(),
            profileEntryId: this.profileEntryId()
        }
    }
}