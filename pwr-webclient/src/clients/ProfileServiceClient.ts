import {APIConsultant} from '../model/APIProfile';
import {AxiosRequestConfig} from 'axios';
import {PowerHttpClient} from './PowerHttpClient';
import {APIAdminNotification} from '../model/admin/AdminNotification';
import {ProfileEntryNotification} from '../model/admin/ProfileEntryNotification';
import {SkillNotification} from '../model/admin/SkillNotification';
import {ConsultantInfoDTO} from '../model/ConsultantInfoDTO';
import {ProfileCheck, ProfileCheckSummary, ProfileConfirmation} from '../model/check/ProfileCheck';

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

    /**
     * Merges skill source into skill target in all profiles, projects and the skill tree. 400, 404 and 409 reject with
     * a {@link PowerApiError} without an error alert, the caller explains them
     */
    public mergeSkill = (source: string, target: string, version?: string): Promise<void> => {
        const url = this.base() + '/admin/skills/merge';
        const params: any = {source, target};
        if (version && version.trim().length > 0) {
            params.version = version.trim();
        }
        this.beginRequest();
        return this.postExpecting(url, [400, 404, 409], null, {params});
    };

    public authenticateAdmin = (): Promise<void> => {
        const url = this.base() + '/admin/';
        this.beginRequest();
        return this.head(url);
    };

    /**
     * The endpoints for OK and delete only accept JSON (`consumes`), although they read no body: without the header
     * they answer 415. Axios drops the header when there is no data at all, so the body is an explicit null.
     */
    private static readonly JSON_WITHOUT_BODY: AxiosRequestConfig = {headers: {'Content-Type': 'application/json'}, data: null};

    public invokeNotificationDelete = (notificationId: number): Promise<void> => {
        const url = this.base() + '/admin/notifications/' + notificationId;
        this.beginRequest();
        return this.delete(url, ProfileServiceClient.JSON_WITHOUT_BODY);
    };

    public invokeNotificationOK = (notificationId: number): Promise<void> => {
        const url = this.base() + '/admin/notifications/' + notificationId;
        this.beginRequest();
        return this.put(url, null, ProfileServiceClient.JSON_WITHOUT_BODY);
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

    /**
     * A profile picture, null if there is none. Loaded with the token, so it can be shown through a blob URL; an img
     * pointing at the API would not send the token. Use PwrProfilePicture, which also caches the pictures.
     */
    public getProfilePicture = (profilePictureId: string): Promise<Blob | null> => {
        const url = this.base() + `/profile-pictures/${profilePictureId}`;
        this.beginRequest();
        return this.getOrNull<Blob>(url, {responseType: 'blob'})
            .then(blob => blob && blob.size > 0 ? blob : null);
    }

    // ------------------------------------------------------------------------------------- profile check (#139)

    /**
     * In the background, without spinner and alert: the card stays away if the check fails
     */
    public getProfileCheck = (initials: string): Promise<ProfileCheck> => {
        return this.getQuietly(this.base() + '/profile/' + encodeURIComponent(initials) + '/check');
    };

    /**
     * "My profile is up to date"; the edge service adds who confirmed
     */
    public confirmProfile = (initials: string): Promise<ProfileCheck> => {
        this.beginRequest();
        return this.post(this.base() + '/profile/' + encodeURIComponent(initials) + '/check/confirmation');
    };

    /** Admins only (edge: /admin/**) */
    public getProfileCheckSummaries = (): Promise<Array<ProfileCheckSummary>> => {
        return this.getQuietly(this.base() + '/admin/profile-checks');
    };

    /** Admins only (edge: /admin/**) */
    public getProfileConfirmations = (initials: string): Promise<Array<ProfileConfirmation>> => {
        return this.getQuietly(this.base() + '/admin/profile-checks/' + encodeURIComponent(initials) + '/confirmations');
    };
}
