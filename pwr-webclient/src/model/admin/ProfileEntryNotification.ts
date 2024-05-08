import {AdminNotification, APIAdminNotification} from './AdminNotification';
import {NameEntity} from '../NameEntity';
import {APINameEntity} from '../APIProfile';

export interface APIProfileEntryNotification extends APIAdminNotification {
    nameEntity: APINameEntity;
    profileEntryId: number;
}


export class ProfileEntryNotification {
    private _adminNotification: AdminNotification;
    private _profileEntryId: number;
    private _nameEntity: NameEntity;

    public get adminNotification(): AdminNotification {
        return this._adminNotification;
    };

    public get profileEntryId(): number {
        return this._profileEntryId;
    }

    public get nameEntity() {
        return this._nameEntity;
    };

    public setNameEntity(nameEntity: NameEntity): ProfileEntryNotification {
        return new ProfileEntryNotification(this.adminNotification, this.profileEntryId, nameEntity);
    }


    protected constructor(adminNotification: AdminNotification,
                          profileEntryId: number,
                          nameEntity: NameEntity
    ) {
        this._adminNotification = adminNotification;
        this._profileEntryId = profileEntryId;
        this._nameEntity = nameEntity;
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
        return {
            ...this.adminNotification.toApi(),
            nameEntity: this.nameEntity.toAPI(),
            profileEntryId: this.profileEntryId
        }
    }
}
