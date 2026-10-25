import {PowerHttpClient} from './PowerHttpClient';
import {APISkillServiceSkill} from '../model/skill/SkillServiceSkill';

import {AxiosRequestConfig} from 'axios';
import {APISkillCategory, SkillCategory} from '../model/skill/SkillCategory';
import {TCategoryNode} from '../model/skill/tree/TCategoryNode';
import {SkillSuggestion} from '../model/skill/SkillSuggestion';
import {LocalizationLanguage} from '../model/view/LocalizationLanguage';
import {HousekeepingFindings} from '../model/admin/HousekeepingFindings';

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

    /**
     * The languages with localizations of skills or categories (#174). Quietly: without them a view profile just
     * offers the names of the skill tree
     */
    public getLocalizationLanguages = (): Promise<Array<LocalizationLanguage>> => {
        return this.getQuietly<Array<LocalizationLanguage>>(this.base() + '/skill/locales');
    };

    public getSkillByName = (name: string): Promise<APISkillServiceSkill> => {
        const url = this.base() + '/skill/byName';
        const config: AxiosRequestConfig = {params: {qualifier: name}};
        return this.get(url, config);
    };

    /**
     * The skill of this name or alias, null if the skill tree doesn't know it; without alert, for lookups while typing
     */
    public findSkillByNameQuietly = (name: string): Promise<APISkillServiceSkill | null> => {
        const config: AxiosRequestConfig = {params: {qualifier: name}};
        return this.getQuietly<APISkillServiceSkill | ''>(this.base() + '/skill/byName', config)
            .then(skill => skill ? skill : null);
    };

    public categorizeSkill = (name: string): Promise<APISkillCategory> => {
        const url = this.base() + '/skill';
        const config: AxiosRequestConfig = {params: {qualifier: name}};
        return this.post(url, null, config);
    };

    public addVersion = (skillId: number, version: string): Promise<string[]> => {
        const url = this.base() + '/skill/{id}/version'.replace('{id}', skillId.toString());
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'text/plain'
            }
        };
        return this.post(url, version, config);
    };

    public deleteVersion = (skillId: number, version: string) => {
        const url = this.base() + '/admin/skill/{id}/version'.replace('{id}', skillId.toString());
        const config: AxiosRequestConfig = {
            data: version,
            headers: {'Content-Type': 'text/plain'}
        };
        return this.delete(url, config);
    };

    /**
     * Adds another spelling to the skill. 400 (empty alias) and 409 (alias belongs to another skill or is the name of
     * another skill) reject with a {@link PowerApiError} without an error alert, the caller explains them
     */
    public addSkillAlias = (skillId: number, alias: string): Promise<APISkillServiceSkill> => {
        const url = this.base() + '/admin/skill/' + skillId + '/alias';
        const config: AxiosRequestConfig = {params: {alias: alias}};
        return this.postExpecting(url, [400, 409], null, config);
    };

    public deleteSkillAlias = (skillId: number, alias: string): Promise<APISkillServiceSkill> => {
        const url = this.base() + '/admin/skill/' + skillId + '/alias';
        const config: AxiosRequestConfig = {params: {alias: alias}};
        return this.delete(url, config);
    };

    /**
     * Skill suggestions for a search term, each with the alias that matched, if one matched better than the name
     */
    public getSkillSuggestions = (searchTerm: string): Promise<Array<SkillSuggestion>> => {
        const config: AxiosRequestConfig = {
            params: {
                maxResults: 10,
                searchterm: searchTerm
            }
        };
        return this.get(this.base() + '/skill/suggestions', config);
    };

    public getCategoryById = (id: number): Promise<APISkillCategory> => {
        const url = this.base() + '/category/' + id;
        return this.get(url);
    };

    public getCategoryChildrenByCategoryId = (id: number): Promise<number[]> => {
        const url = this.base() + '/category/' + id + '/children';
        return this.get(url);
    };

    public postCategorizeSkill = (qualifier: string): Promise<APISkillCategory> => {
        const url = this.base() + '/skill';
        let config: AxiosRequestConfig = {params: {qualifier: qualifier}};
        return this.post(url, config);
    };

    public getFullTree = (): Promise<TCategoryNode> => {
        const url = this.base() + '/skill/tree';
        return this.get(url);
    };

    public patchSetIsDisplayCategory = (categoryId: number, isDisplay: boolean): Promise<APISkillCategory> => {
        const url = this.base() + '/admin/category/' + categoryId + '/display/' + isDisplay;
        return this.patch(url);
    };

    public postLocaleToCategory = (categoryId: number, locale: string, qualifier: string): Promise<APISkillCategory> => {
        const url = this.base() + '/admin/category/' + categoryId + '/locale';
        const config: AxiosRequestConfig = {
            params: {
                lang: locale,
                qualifier: qualifier
            }
        };
        return this.post(url, null, config);
    };

    public deleteLocaleFromCategory = (categoryId: number, locale: string): Promise<APISkillCategory> => {
        const url = this.base() + '/admin/category/' + categoryId + '/locale/' + locale;
        return this.delete(url);
    };

    public addSkillLocale = (skillId: number, language: string, qualifier: string): Promise<APISkillServiceSkill> => {
        const url = this.base() + '/admin/skill/' + skillId + '/locale/' + language;
        const config: AxiosRequestConfig = {params: {qualifier: qualifier}};
        return this.post(url, null, config);
    };

    public deleteSkillLocale = (skillId: number, language: string): Promise<APISkillServiceSkill> => {
        const url = this.base() + '/admin/skill/' + skillId + '/locale/' + language;
        return this.delete(url);
    };

    public postNewCategory = (parentId: number, category: SkillCategory): Promise<APISkillCategory> => {
        const url = this.base() + '/admin/category/' + parentId;
        return this.post(url, category);
    };

    public postNewSkill = (categoryId: number, qualifier: string): Promise<APISkillServiceSkill> => {
        const url = this.base() + '/admin/skill/category/' + categoryId;
        // Only the name: the model's fields are private (`_qualifier`), as JSON the skill had no name
        return this.post(url, {qualifier: qualifier});
    };

    public deleteCategory = (categoryId: number) => {
        const url = this.base() + '/admin/category/' + categoryId;
        return this.delete(url);
    };

    public patchMoveCategory = (newParentId: number, toMoveId: number): Promise<APISkillCategory> => {
        const url = this.base() + '/admin/category/' + toMoveId + '/category/' + newParentId;
        return this.patch(url);
    };

    public patchMoveSkill = (skillId: number, newCategoryId: number) => {
        const url = this.base() + '/admin/skill/' + skillId + '/category/' + newCategoryId;
        return this.patch(url);
    };


    /**
     * Housekeeping, rubric unused (#288): own skills no profile uses. Quietly, like the other services: the page shows
     * a service that does not answer next to the others
     */
    public getUnusedHousekeeping = (): Promise<Array<HousekeepingFindings>> => {
        return this.getQuietly(this.base() + '/admin/housekeeping/unused');
    };

    /** Deletes what the check finds now; the answer says how many */
    public cleanUnusedHousekeeping = (check: string): Promise<HousekeepingFindings> => {
        const url = this.base() + '/admin/housekeeping/unused/' + encodeURIComponent(check);
        return this.delete(url);
    };
}
