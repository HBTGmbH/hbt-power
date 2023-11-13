import {PowerHttpClient} from './PowerHttpClient';
import {APISkillServiceSkill, SkillServiceSkill} from '../model/skill/SkillServiceSkill';

import {AxiosRequestConfig} from 'axios';
import {APISkillCategory, SkillCategory} from '../model/skill/SkillCategory';
import {TCategoryNode} from '../model/skill/tree/TCategoryNode';
import {APIBuildInfo} from '../model/metadata/BuildInfo';

declare const POWER_SKILL_SERVICE_URL: string;

export class SkillServiceClient extends PowerHttpClient {

    private static _instance: SkillServiceClient;

    private constructor() {
        super();
    }

    public static instance(): SkillServiceClient {
        if (!this._instance) {
            this._instance = new SkillServiceClient();
        }
        return this._instance;
    }

    private base = (): string => {
        return POWER_SKILL_SERVICE_URL;
    };

    public getBuildInfo = (): Promise<APIBuildInfo> => {
        const url = this.base() + '/actuator/info';
        this.beginRequest();
        return this.get<any, APIBuildInfo>(url)
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

    public getSkillByName = (name: string): Promise<APISkillServiceSkill> => {
        const url = this.base() + '/skill/byName';
        const config: AxiosRequestConfig = {params: {qualifier: name}};
        this.beginRequest();
        return this.get(url, config);
    };

    public categorizeSkill = (name: string): Promise<APISkillCategory> => {
        const url = this.base() + '/skill';
        const config: AxiosRequestConfig = {params: {qualifier: name}};
        this.beginRequest();
        return this.post(url, null, config);
    };

    public addVersion = (skillId: number, version: string): Promise<string[]> => {
        const url = this.base() + '/skill/{id}/version'.replace('{id}', skillId.toString());
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'text/plain'
            }
        };
        this.beginRequest();
        return this.post(url, version, config);
    };

    public deleteVersion = (skillId: number, version: string) => {
        const url = this.base() + '/skill/{id}/version'.replace('{id}', skillId.toString());
        const config: AxiosRequestConfig = {
            data: version,
            headers: {'Content-Type': 'text/plain'}
        };
        this.beginRequest();
        return this.delete(url, config);
    };

    public getSearchSkillURL = (): string => {
        return this.base() + '/skill/search';

    };

    public getSearchSkill = (searchTerm: string): Promise<Array<string>> => {
        let config: AxiosRequestConfig = {
            params: {
                maxResults: 10,
                searchterm: searchTerm
            }
        };
        const url = this.getSearchSkillURL();
        return this.get(url, config);
    }

    public getCategoryById = (id: number): Promise<APISkillCategory> => {
        const url = this.base() + '/category/' + id;
        this.beginRequest();
        return this.get(url);
    };

    public getCategoryChildrenByCategoryId = (id: number): Promise<number[]> => {
        const url = this.base() + '/category/' + id + '/children';
        this.beginRequest();
        return this.get(url);
    };

    public postCategorizeSkill = (qualifier: string): Promise<APISkillCategory> => {
        const url = this.base() + '/skill';
        let config: AxiosRequestConfig = {params: {qualifier: qualifier}};
        this.beginRequest();
        return this.post(url, config);
    };

    public getFullTree = (): Promise<TCategoryNode> => {
        const url = this.base() + '/skill/tree';
        this.beginRequest();
        return this.get(url);
    };

    /**
     * String representing a delete operation on the blacklist.
     * @param id of the category to be whitelisted
     * @returns {string} the representing the full API URI
     */
    public deleteBlacklistCategory = (id: number): Promise<APISkillCategory> => {
        const url = this.base() + '/category/blacklist/' + id;
        this.beginRequest();
        return this.delete(url);
    };

    public postBlacklistCategory = (id: number): Promise<APISkillCategory> => {
        const url = this.base() + '/category/blacklist/' + id;
        this.beginRequest();
        return this.post(url);
    };

    public patchSetIsDisplayCategory = (categoryId: number, isDisplay: boolean): Promise<APISkillCategory> => {
        const url = this.base() + '/category/' + categoryId + '/display/' + isDisplay;
        this.beginRequest();
        return this.post(url);
    };

    public postLocaleToCategory = (categoryId: number, locale: string, qualifier: string): Promise<APISkillCategory> => {
        const url = this.base() + '/category/' + categoryId + '/locale';
        const config: AxiosRequestConfig = {
            params: {
                lang: locale,
                qualifier: qualifier
            }
        };
        this.beginRequest();
        return this.post(url, null, config);
    };

    public deleteLocaleFromCategory = (categoryId: number, locale: string): Promise<APISkillCategory> => {
        const url = this.base() + '/category/' + categoryId + '/locale/' + locale;
        this.beginRequest();
        return this.delete(url);
    };

    public addSkillLocale = (categoryId: number, language: string, qualifier: string): Promise<APISkillServiceSkill> => {
        const url = this.base() + '/skill/' + categoryId + '/locale/' + language;
        let config: AxiosRequestConfig = {params: {qualifier: qualifier}};
        this.beginRequest();
        return this.post(url);
    };

    public deleteSkillLocale = (categoryId: number, language: string) => {
        const url = this.base() + '/skill/' + categoryId + '/locale/' + language;
        this.beginRequest();
        return this.delete(url);
    };

    public skillVersion = (skillId: number, newVersion: string) => {
        const url = this.base() + '/skill/' + skillId + '/version/' + newVersion;
        this.beginRequest();
        return this.post(url);
    };

    public postNewCategory = (parentId: number, category: SkillCategory): Promise<APISkillCategory> => {
        const url = this.base() + '/category/' + parentId;
        this.beginRequest();
        return this.post(url, category);
    };

    public postNewSkill = (categoryId: number, qualifier: string): Promise<APISkillServiceSkill> => {
        const url = this.base() + '/skill/category/' + categoryId;
        let skill: SkillServiceSkill = SkillServiceSkill.forQualifier(qualifier);
        this.beginRequest();
        return this.post(url, skill);
    };

    public deleteCustomSkill = (skillId: number) => {
        const url = this.base() + '/skill/' + skillId;
        this.beginRequest();
        return this.delete(url);
    };

    public deleteCategory = (parentId: number) => {
        const url = this.base() + '/category/' + parentId;
        this.beginRequest();
        return this.post(url);
    };

    public patchMoveCategory = (newParentId: number, toMoveId: number): Promise<APISkillCategory> => {
        const url = this.base() + '/category/' + toMoveId + '/category/' + newParentId;
        this.beginRequest();
        return this.patch(url);
    };

    public patchMoveSkill = (skillId: number, newCategoryId: number) => {
        const url = this.base() + '/skill/' + skillId + '/category/' + newCategoryId;
        this.beginRequest();
        return this.patch(url);
    };

}
