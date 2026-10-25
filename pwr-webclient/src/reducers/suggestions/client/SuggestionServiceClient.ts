import {PowerHttpClient} from '../../../clients/PowerHttpClient';

import {NameEntityAlias} from '../../../model/NameEntityAlias';
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

    /** The aliases of all profile elements (#270); quietly, the suggestions work without them */
    public getAliases = (): Promise<Array<NameEntityAlias>> => {
        return this.getQuietly(this.base() + '/suggestions/aliases');
    };

    public getQualificationSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/qualifications';
        return this.get(url);
    };

    public getLanguageSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/languages';
        return this.get(url);
    };

    public getEducationSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/educations';
        return this.get(url);
    };

    public getTrainingSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/trainings';
        return this.get(url);
    };

    public getSectorSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/sectors';
        return this.get(url);
    };

    public getKeySkillSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/specialfields';
        return this.get(url);
    };

    public getCareerSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/career';
        return this.get(url);
    };

    public getProjectRoleSuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/projectroles';
        return this.get(url);
    };

    public getCompanySuggestions = (): Promise<Array<NameEntity>> => {
        const url = this.base() + '/suggestions/companies';
        return this.get(url);
    };

    public getSkillSuggestions = (): Promise<Array<string>> => {
        const url = this.base() + '/suggestions/skills';
        return this.get(url);
    };

    /**
     * In the background while a project is edited (#41): no error alert, the caller handles a failure
     */
    public getSkillsRecommendation = (project: Project): Promise<Array<ProfileSkill>> => {
        const url = this.base() + '/suggestions/skillRecommendation';
        return this.postQuietly(url, project);
    };

}
