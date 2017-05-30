import {doop} from 'doop';
import {APINameEntity} from '../APIProfile';
import {NameEntity} from '../NameEntity';
export interface APIAdminNotification {
    id: number;
    notificationType: string;
    initials: string;
    occurrence: string;
    nameEntity: APINameEntity;
}

@doop
export class AdminNotification {
    @doop public get id() {return doop<number, this>()};
    @doop public get initials() {return doop<string, this>()};
    @doop public get notificationType()  {return doop<string, this>()};
    @doop public get occurrence() {return doop<Date, this>()};
    @doop public get nameEntity() {return doop<NameEntity, this>()};

    private constructor(id: number, initials: string, notificationType: string, occurrence: Date, nameEntity: NameEntity) {
        return this.id(id).initials(initials).notificationType(notificationType).occurrence(occurrence).nameEntity(nameEntity);
    }

    public static fromAPI(apiAdminNotification: APIAdminNotification) {
        return new AdminNotification(
            Number(apiAdminNotification.id),
            apiAdminNotification.initials,
            apiAdminNotification.notificationType,
            new Date(apiAdminNotification.occurrence),
            NameEntity.fromAPI(apiAdminNotification.nameEntity)
        )
    }

}