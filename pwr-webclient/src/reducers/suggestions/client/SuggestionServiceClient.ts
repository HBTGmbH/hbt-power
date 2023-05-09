import {PowerHttpClient} from '../../../clients/PowerHttpClient';

import {NameEntity} from '../../profile-new/profile/model/NameEntity';
import {Project} from '../../profile-new/profile/model/Project';
import {ProfileSkill} from '../../profile-new/profile/model/ProfileSkill';

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
        return this.get(url);
    };

    public getLanguageSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/languages';
        this.beginRequest();
        return this.get(url);
    };

    public getEducationSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/educations';
        this.beginRequest();
        return this.get(url);
    };

    public getTrainingSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/trainings';
        this.beginRequest();
        return this.get(url);
    };

    public getSectorSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/sectors';
        this.beginRequest();
        return this.get(url);
    };

    public getKeySkillSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/specialfields';
        this.beginRequest();
        return this.get(url);
    };

    public getCareerSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/career';
        this.beginRequest();
        return this.get(url);
    };

    public getProjectRoleSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/projectroles';
        this.beginRequest();
        return this.get(url);
    };

    public getCompanySuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/companies';
        this.beginRequest();
        return this.get(url);
    };

    public getSkillSuggestions = (): Promise<Array<string>> => {
        const url = this.base() + '/suggestions/skills';
        this.beginRequest();
        return this.get(url);
    };

    public getSkillsRecommendation = (project: Project): Promise<Array<ProfileSkill>> => {
        const url = this.base() + '/suggestions/skillRecommendation';
        this.beginRequest();
        return this.post(url, project);
    };

}
