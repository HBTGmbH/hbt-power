import {PowerHttpClient} from './PowerHttpClient';
import {APISkillServiceSkill} from '../model/skill/SkillServiceSkill';

import axios, {AxiosRequestConfig} from 'axios';
import {APISkillCategory} from '../model/skill/SkillCategory';

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

    public getSkillByName = (name: string): Promise<APISkillServiceSkill> => {
        const url = this.base() + '/skill/byName';
        const config: AxiosRequestConfig = {params: {qualifier: name}};
        return this.executeRequest(axios.get(url, config));
    };

    public categorizeSkill = (name: string): Promise<APISkillCategory> => {
        const url = this.base() + '/skill';
        const config: AxiosRequestConfig = {params: {qualifier: name}};
        return this.executeRequest(axios.post(url, null, config));
    };

    public addSkillVersion = (skillId: number, version: string): Promise<string[]> => {
        const url = this.base() + '/skill/' + skillId + '/version/' + version;
        return this.executeRequest(axios.post(url));
    };

    public deleteSkillVersion = (skillId: number, version: string) => {
        const url = this.base() + '/skill/' + skillId + '/version/' + version;
        return this.executeRequest(axios.delete(url));
    };
}
