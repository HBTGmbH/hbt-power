import {Promise} from 'es6-promise';
import {APIConsultant} from '../model/APIProfile';
import axios, {AxiosRequestConfig} from 'axios';
import {NameEntity} from '../model/NameEntity';
import {PowerHttpClient} from './PowerHttpClient';
import {APIBuildInfo} from '../model/metadata/BuildInfo';
import {APIAdminNotification} from '../model/admin/AdminNotification';
import {store} from '../reducers/reducerIndex';
import {ProfileEntryNotification} from '../model/admin/ProfileEntryNotification';
import {SkillNotification} from '../model/admin/SkillNotification';

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

    private credentialsConfig(): AxiosRequestConfig {
        return store.getState().adminReducer.adminAuthConfig();
    }


    public getConsultant = (initials: string): Promise<APIConsultant> => {
        const url = this.base() + '/consultants/' + initials;
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getConsultants = (): Promise<Array<APIConsultant>> => {
        const url = this.base() + '/consultants/';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public createConsultant = (consultant: APIConsultant): Promise<APIConsultant> => {
        let config: AxiosRequestConfig = {
            params: {
                action: 'new'
            }
        };
        const url = this.base() + '/consultants/';
        this.beginRequest();
        return this.preProcess(axios.post(url, consultant, config));
    };

    public updateConsultant = (consultant: APIConsultant): Promise<APIConsultant> => {
        const url = this.base() + '/consultants/' + consultant.initials;
        this.beginRequest();
        return this.preProcess(axios.patch(url, consultant));
    };

    public getQualificationSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/qualifications';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getLanguageSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/languages';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getEducationSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/educations';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getTrainingSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/trainings';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getSectorSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/sectors';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getKeySkillSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/keyskills';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getCareerSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/career';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getProjectRoleSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/projectroles';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getCompanySuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/companies';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getSkillSuggestions = (): Promise<Array<String>> => {
        const url = this.base() + '/suggestions/skills';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getBuildInfo = (): Promise<APIBuildInfo> => {
        const url = this.base() + '/actuator/info';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getAdminNotifications = (): Promise<Array<APIAdminNotification>> => {
        const url = this.base() + '/admin/notifications';
        this.beginRequest();
        return this.preProcess(axios.get(url, this.credentialsConfig()));
    };

    public getTrashedAdminNotifications = (): Promise<Array<APIAdminNotification>> => {
        const url = this.base() + '/admin/notifications/trash';
        this.beginRequest();
        return this.preProcess(axios.get(url, this.credentialsConfig()));
    };

    public trashNotifications = (ids: Array<number>): Promise<void> => {
        const url = this.base() + '/admin/notifications/trash';
        this.beginRequest();
        return this.preProcess(axios.put(url, ids, this.credentialsConfig()));
    };

    public deleteTrashedNotifications = (): Promise<void> => {
        const url = this.base() + '/admin/notifications/trash';
        this.beginRequest();
        return this.preProcess(axios.delete(url, this.credentialsConfig()));
    };

    public renameSkill = (oldName: string, newName: string): Promise<void> => {
        const url = this.base() + '/admin/skills/name';
        let config = this.credentialsConfig();
        config.params = {
            oldname: oldName,
            newname: newName
        };
        this.beginRequest();
        return this.preProcess(axios.patch(url, null, config));
    };

    public authenticateAdmin = (): Promise<void> => {
        const url = this.base() + '/admin/';
        let config = this.credentialsConfig();
        this.beginRequest();
        return this.preProcess(axios.head(url, config));
    };

    public invokeNotificationDelete = (notificationId: number): Promise<void> => {
        const url = this.base() + '/admin/notifications/' + notificationId;
        const config = this.credentialsConfig();
        this.beginRequest();
        return this.preProcess(axios.delete(url, config));
    };

    public invokeNotificationOK = (notificationId: number): Promise<void> => {
        const url = this.base() + '/admin/notifications/' + notificationId;
        const config = this.credentialsConfig();
        this.beginRequest();
        return this.preProcess(axios.put(url, null, config));
    };

    public invokeNotificationEdit = (notification: ProfileEntryNotification | SkillNotification): Promise<void> => {
        const url = this.base() + '/admin/notifications';
        const config = this.credentialsConfig();
        this.beginRequest();
        return this.preProcess(axios.patch(url, notification.toAPI(), config));
    };

}
