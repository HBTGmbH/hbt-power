import {AdminNotification, APIAdminNotification} from './AdminNotification';
import {doop} from 'doop';
import {NameEntity} from '../NameEntity';
import {APINameEntity} from '../APIProfile';

export interface APIProfileEntryNotification extends APIAdminNotification {
    nameEntity: APINameEntity;
    profileEntryId: number;
}


@doop
export class ProfileEntryNotification {
    @doop
    public get adminNotification() {
        return doop<AdminNotification, this>();
    };

    @doop
    public get profileEntryId() {
        return doop<number, this>();
    }

    @doop
    public get nameEntity() {
        return doop<NameEntity, this>();
    };

    protected constructor(adminNotification: AdminNotification,
                          profileEntryId: number,
                          nameEntity: NameEntity
    ) {

        return this.adminNotification(adminNotification)
            .profileEntryId(profileEntryId)
            .nameEntity(nameEntity);
    }

    public static of(adminNotification: AdminNotification, profileEntryId: number, nameEntity: NameEntity) {
        return new ProfileEntryNotification(adminNotification, profileEntryId, nameEntity);
    }

    public static fromAPI(apiProfileEntryNotification: APIProfileEntryNotification) {
        return new ProfileEntryNotification(
            AdminNotification.fromAPI(apiProfileEntryNotification),
            apiProfileEntryNotification.profileEntryId,
            NameEntity.fromAPI(apiProfileEntryNotification.nameEntity)
        );
    }

    public toAPI(): APIProfileEntryNotification {
        return Object.assign(this.adminNotification().toApi(), {
            nameEntity: this.nameEntity().toAPI(),
            profileEntryId: this.profileEntryId()
        });
    }
}
