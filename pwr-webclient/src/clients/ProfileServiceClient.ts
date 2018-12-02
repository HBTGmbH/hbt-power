import {Promise} from 'es6-promise';
import {APIConsultant, APIProfile} from '../model/APIProfile';
import axios, {AxiosRequestConfig} from 'axios';
import {NameEntity} from '../model/NameEntity';
import {PowerHttpClient} from './PowerHttpClient';
import {APIBuildInfo} from '../model/metadata/BuildInfo';
import {APIAdminNotification} from '../model/admin/AdminNotification';
import {store} from '../reducers/reducerIndex';

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

    public getProfile = (initials: string): Promise<APIProfile> => {
        const url = this.base() + '/api/profiles/' + initials;
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public saveProfile = (initials: string, profile: APIProfile): Promise<APIProfile> => {
        const url = this.base() + '/api/profiles/' + initials;
        this.beginRequest();
        return this.preProcess(axios.put(url, profile));
    };

    public getConsultant = (initials: string): Promise<APIConsultant> => {
        const url = this.base() +  '/api/consultants/' + initials;
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getConsultants = (): Promise<Array<APIConsultant>> => {
        const url = this.base() +  "/api/consultants/";
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public createConsultant = (consultant: APIConsultant): Promise<APIConsultant> => {
        let config: AxiosRequestConfig = {
            params: {
                action: 'new'
            }
        };
        const url = this.base() +  "/api/consultants/";
        this.beginRequest();
        return this.preProcess(axios.post(url, consultant, config));
    };

    public updateConsultant = (consultant: APIConsultant): Promise<APIConsultant> => {
        const url = this.base() +  "/api/consultants/" + consultant.initials;
        this.beginRequest();
        return this.preProcess(axios.patch(url, consultant));
    }

    public getQualificationSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/api/suggestions/qualifications';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getLanguageSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/api/suggestions/languages';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getEducationSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/api/suggestions/educations';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getTrainingSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/api/suggestions/trainings';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getSectorSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/api/suggestions/sectors';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getKeySkillSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/api/suggestions/keyskills';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getCareerSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/api/suggestions/career';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getProjectRoleSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/api/suggestions/projectroles';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getCompanySuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/api/suggestions/companies';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getSkillSuggestions = (): Promise<Array<String>> => {
        const url = this.base() + '/api/suggestions/skills';
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getBuildInfo = (): Promise<APIBuildInfo> => {
        const url = this.base() + "/meta/info";
        this.beginRequest();
        return this.preProcess(axios.get(url));
    };

    public getAdminNotifications = (): Promise<Array<APIAdminNotification>> => {
        const url = this.base() + "/api/admin/notifications";
        this.beginRequest();
        return this.preProcess(axios.get(url, this.credentialsConfig()));
    };

    public getTrashedAdminNotifications = (): Promise<Array<APIAdminNotification>> => {
        const url = this.base() + "/api/admin/notifications/trash";
        this.beginRequest();
        return this.preProcess(axios.get(url, this.credentialsConfig()));
    };

    public trashNotifications = (ids: Array<number>): Promise<void> => {
        const url = this.base() + "/api/admin/notifications/trash";
        this.beginRequest();
        return this.preProcess(axios.put(url, ids, this.credentialsConfig()));
    };

    public deleteTrashedNotifications = (): Promise<void> => {
        const url = this.base() + "/api/admin/notifications/trash";
        this.beginRequest();
        return this.preProcess(axios.delete(url, this.credentialsConfig()));
    };

    public renameSkill = (oldName: string, newName: string): Promise<void> => {
        const url = this.base() + "/api/admin/skills/name";
        let config = this.credentialsConfig();
        config.params = {
            oldname: oldName,
            newname: newName
        };
        this.beginRequest();
        return this.preProcess(axios.patch(url, null, config));
    };

    public authenticateAdmin = (): Promise<void> => {
        const url = this.base() + "/api/admin";
        let config = this.credentialsConfig();
        this.beginRequest();
        return this.preProcess(axios.head(url, config));
    }

}