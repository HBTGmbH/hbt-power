import {PowerHttpClient} from '../../../clients/PowerHttpClient';
import axios from 'axios';
import {Promise} from 'es6-promise';
import {NameEntity} from '../../profile-new/profile/model/NameEntity';

declare const POWER_PROFILE_SERVICE_URL: string;

export class SuggestionServiceClient extends PowerHttpClient {


    private static _instance: SuggestionServiceClient;

    private constructor() {
        super();
    }

    public static instance(): SuggestionServiceClient {
        if (!this._instance) {
            this._instance = new SuggestionServiceClient();
        }
        return this._instance;
    }

    private base(): string {
        return POWER_PROFILE_SERVICE_URL;
    }
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

}