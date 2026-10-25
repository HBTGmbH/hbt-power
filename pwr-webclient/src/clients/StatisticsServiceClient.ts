import {PowerHttpClient} from './PowerHttpClient';
import {AxiosRequestConfig} from 'axios';
import {APIConsultantClusterInfo, APIProfileSkillMetric, APISkillUsageMetric} from '../model/statistics/ApiMetrics';
import {APIScatterSkill} from '../model/statistics/ScatterSkill';
import {APIConsultant} from '../model/APIProfile';

declare const POWER_STATISTICS_SERVICE_URL: string;

/**
 * Singleton for configuration purposes? I don't know, doesn't matter for now. Maybe if the whole URL-Configuration
 * is being reworked, this will make sense.
 */
export class StatisticsServiceClient extends PowerHttpClient {


    private static _instance: StatisticsServiceClient;

    private constructor() {
        super();
    }

    public static instance(): StatisticsServiceClient {
        if (!this._instance) {
            this._instance = new StatisticsServiceClient();
        }
        return this._instance;
    }

    private base(): string {
        return POWER_STATISTICS_SERVICE_URL;
    }


    public getSkillUsagesAbsolute = (): Promise<Array<APISkillUsageMetric>> => {
        const url = this.base() + '/statistics/skill/usage/absolute';
        return this.get(url);
    };

    public getSkillUsageRelative = (): Promise<Array<APISkillUsageMetric>> => {
        const url = this.base() + '/statistics/skill/usage/relative';
        return this.get(url);
    };

    public getProfileStatistics = (initials: string): Promise<APIProfileSkillMetric> => {
        const url = this.base() + '/statistics/skill/common/' + initials;
        return this.get(url);
    };

    public headStatisticsServiceAvailable = () => {
        const url = this.base() + '/statistics/ping';
        return this.get(url);
    };

    public getConsultantClusterInfo = (initials: string): Promise<APIConsultantClusterInfo> => {
        const url = this.base() + '/statistics/network/consultant/' + initials;
        return this.get(url);
    };

    public getScatterSkills = (): Promise<Array<APIScatterSkill>> => {
        const url = this.base() + '/statistics/skill/level';
        return this.get(url);
    };

    public postFindConsultantBySkills = (skills: string[]): Promise<Array<any>> => {
        const url = this.base() + '/statistics/consultant/find/skills';
        return this.post(url, skills);
    };


    public getNameEntityUsageInfo(config: AxiosRequestConfig): Promise<Array<APIConsultant>> {
        const url = this.base() + '/admin/statistics/entries/referencing';
        return this.get(url, config);
    }

    public getSkillUsageInfo(skillName: string): Promise<Array<APIConsultant>> {
        const url = this.base() + '/admin/statistics/skill/referencing';
        let config: AxiosRequestConfig = {
            params: {'skill': skillName}
        };
        return this.get(url, config);
    }
}
