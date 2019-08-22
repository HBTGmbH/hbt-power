import {PowerHttpClient} from './PowerHttpClient';
import {APISkillServiceSkill} from '../model/skill/SkillServiceSkill';

import axios, {AxiosRequestConfig} from 'axios';
import {getSkillByName} from '../API_CONFIG';
import {APISkillCategory} from '../model/skill/SkillCategory';

declare const POWER_SKILL_SERVICE_URL: string;

export class SkillServiceClient extends PowerHttpClient {

    private base = (): string => {
        return POWER_SKILL_SERVICE_URL;
    };

    public getSkillByName = (name: string): Promise<APISkillServiceSkill> => {
        const url = this.base() + "/skill/byName";
        const config: AxiosRequestConfig = {params: {qualifier: name}};
        return this.executeRequest(axios.get(getSkillByName(), config));
    };

    public categorizeSkill = (name: string): Promise<APISkillCategory> => {
        const url = this.base() + "/skill";
        const config: AxiosRequestConfig = {params: {qualifier: name}};
        return this.executeRequest(axios.post(url, null, config));
    };
}
