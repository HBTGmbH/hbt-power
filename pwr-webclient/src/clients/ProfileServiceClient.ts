import {APIConsultant} from '../model/APIProfile';
import {AxiosRequestConfig} from 'axios';
import {PowerHttpClient} from './PowerHttpClient';
import {APIBuildInfo} from '../model/metadata/BuildInfo';
import {APIAdminNotification} from '../model/admin/AdminNotification';
import {ProfileEntryNotification} from '../model/admin/ProfileEntryNotification';
import {SkillNotification} from '../model/admin/SkillNotification';
import {ConsultantInfoDTO} from '../model/ConsultantInfoDTO';

declare const POWER_PROFILE_SERVICE_URL: string;

/**
 * Singleton for configuration purposes? I don't know, doesn't matter for now. Maybe if the whole URL-Configuration
 * is being reworked, this will make sense.
 */
export class ProfileServiceClient extends PowerHttpClient {


    private static _instance: ProfileServiceClient;

    private constructor() {
        super();
    }

    public static instance(): ProfileServiceClient {
        if (!this._instance) {
            this._instance = new ProfileServiceClient();
        }
        return this._instance;
    }

    private base(): string {
        return POWER_PROFILE_SERVICE_URL;
    }

    public getBuildInfoURL() {
        return this.base() + '/actuator/info';
    }

    public getConsultant = (initials: string): Promise<APIConsultant> => {
        const url = this.base() + '/consultants/' + initials;
        this.beginRequest();
        return this.get(url);
    };

    public getConsultants = (): Promise<Array<APIConsultant>> => {
        const url = this.base() + '/consultants/';
        this.beginRequest();
        return this.get(url);
    };

    public createConsultant = (consultant: APIConsultant): Promise<APIConsultant> => {
        let config: AxiosRequestConfig = {
            params: {
                action: 'new'
            }
        };
        const url = this.base() + '/consultants/';
        this.beginRequest();
        return this.post(url, consultant, config);
    };

    public updateConsultant = (consultant: APIConsultant): Promise<APIConsultant> => {
        const url = this.base() + '/consultants/' + consultant.initials;
        this.beginRequest();
        return this.patch(url, consultant);
    };

    public getSkillSuggestions = (): Promise<Array<String>> => {
        const url = this.base() + '/suggestions/skills';
        this.beginRequest();
        return this.get(url);
    };

    public getBuildInfo = (): Promise<APIBuildInfo> => {
        const url = this.base() + '/actuator/info';
        this.beginRequest();
        return this.get<APIBuildInfo>(url)
            // Append swagger ref
            .then(value => {
                return ({
                    ...value,
                    build: {
                        ...value.build,
                        swaggerHref: this.base() + '/v2/api-docs'
                    }
                })
            })
    };

    public getAdminNotifications = (): Promise<Array<APIAdminNotification>> => {
        const url = this.base() + '/admin/notifications';
        this.beginRequest();
        return this.get(url);
    };

    public getTrashedAdminNotifications = (): Promise<Array<APIAdminNotification>> => {
        const url = this.base() + '/admin/notifications/trash';
        this.beginRequest();
        return this.get(url);
    };

    public trashNotifications = (ids: Array<number>): Promise<void> => {
        const url = this.base() + '/admin/notifications/trash';
        this.beginRequest();
        return this.put(url, ids);
    };

    public deleteTrashedNotifications = (): Promise<void> => {
        const url = this.base() + '/admin/notifications/trash';
        this.beginRequest();
        return this.delete(url);
    };

    public renameSkill = (oldName: string, newName: string): Promise<void> => {
        const url = this.base() + '/admin/skills/name';
        const config = {
            params: {
                oldname: oldName,
                newname: newName
            }
        }
        this.beginRequest();
        return this.patch(url, null, config);
    };

    public authenticateAdmin = (): Promise<void> => {
        const url = this.base() + '/admin/';
        this.beginRequest();
        return this.head(url);
    };

    public invokeNotificationDelete = (notificationId: number): Promise<void> => {
        const url = this.base() + '/admin/notifications/' + notificationId;
        this.beginRequest();
        return this.delete(url);
    };

    public invokeNotificationOK = (notificationId: number): Promise<void> => {
        const url = this.base() + '/admin/notifications/' + notificationId;
        this.beginRequest();
        return this.put(url, null);
    };

    public invokeNotificationEdit = (notification: ProfileEntryNotification | SkillNotification): Promise<void> => {
        const url = this.base() + '/admin/notifications';
        this.beginRequest();
        return this.patch(url, notification.toAPI());
    };


    public deleteConsultant = (initials: string): Promise<void> => {
        const url = this.base() + `/consultants/${initials}/delete`;
        this.beginRequest();
        return this.delete(url);
    };

    public getAllConsultantInfos = (): Promise<ConsultantInfoDTO[]> => {
        const url = this.base() + `/consultants/info`;
        this.beginRequest();
        return this.get(url);
    };

    public uploadProfilePicture = (picture: File): Promise<string> => {
        const url = this.base() + `/profile-pictures`;
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        const formData = new FormData();
        formData.append("file", picture);
        this.beginRequest();
        return this.post<{id: string}>(url, formData, config)
            .then(response => response.id)
    }

    public deleteProfilePicture = (id: string): Promise<void> => {
        const url = this.base() + `/profile-pictures/${id}`;
        this.beginRequest();
        return this.delete(url);
    }

    public getConsultantInfo = (): Promise<void> => {
        const url = this.base() + `/consultants/info`;
        this.beginRequest();
        return this.get(url);
    }

    getProfilePictureUrl(profilePictureId: string): string {
        return  this.base() + `/profile-pictures/${profilePictureId}`;
    }
}
