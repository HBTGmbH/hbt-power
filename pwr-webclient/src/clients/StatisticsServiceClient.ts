import {PowerHttpClient} from './PowerHttpClient';
import axios, {AxiosRequestConfig} from 'axios';
import {
    APIConsultantClusterInfo,
    APINetwork,
    APIProfileSkillMetric,
    APISkillUsageMetric
} from '../model/statistics/ApiMetrics';
import {APIScatterSkill} from '../model/statistics/ScatterSkill';
import {APIConsultant} from '../model/APIProfile';

declare const POWER_API_HOST_STATISTICS: string;
declare const POWER_API_PORT_STATISTICS: string;
declare const POWER_API_SUFFIX_STATISTICS: string;

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
        return POWER_API_HOST_STATISTICS + ':' + POWER_API_PORT_STATISTICS + POWER_API_SUFFIX_STATISTICS;
    }


    public getSkillUsagesAbsolute = (): Promise<Array<APISkillUsageMetric>> => {
        const url = this.base() + '/statistics/skill/usage/absolute';
        let config: AxiosRequestConfig = {
            params: {
                max: 500
            }
        };
        this.beginRequest();
        return this.executeRequest(axios.get(url, config));
    };

    public getSkillUsageRelative = (): Promise<Array<APISkillUsageMetric>> => {
        const url = this.base() + '/statistics/skill/usage/relative';
        let config: AxiosRequestConfig = {
            params: {
                max: 500
            }
        };
        this.beginRequest();
        return this.executeRequest(axios.get(url, config));
    };

    public getProfileStatistics = (initials: string): Promise<APIProfileSkillMetric> => {
        const url = this.base() + '/statistics/skill/common/' + initials;
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    };

    public getKMedProfileNetwork = (): Promise<APINetwork> => {
        const url = this.base() + '/statistics/network/kmed';
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    };

    public headStatisticsServiceAvailable = () => {
        const url = this.base() + '/statistics';
        this.beginRequest();
        return this.executeRequest(axios.head(url));
    };

    public getConsultantClusterInfo = (initials: string): Promise<APIConsultantClusterInfo> => {
        const url = this.base() + '/statistics/network/consultant/' + initials;
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    };

    public getScatterSkills = (): Promise<Array<APIScatterSkill>> => {
        const url = this.base() + '/statistics/skill/level';
        this.beginRequest();
        return this.executeRequest(axios.get(url));
    };

    public postFindConsultantBySkills = (skills: string[]) => {
        const url = this.base() + '/statistics/consultant/find/skills';
        this.beginRequest();
        return this.executeRequest(axios.post(url, skills));
    };


    public getNameEntityUsageInfo(config: AxiosRequestConfig): Promise<Array<APIConsultant>> {
        const url = this.base() + '/statistics/entries/referencing';
        this.beginRequest();
        return this.executeRequest(axios.get(url, config));
    }

    public getSkillUsageInfo(skillName: string): Promise<Array<APIConsultant>> {
        const url = this.base() + '/statistics/skill/referencing';
        let config: AxiosRequestConfig = {
            params: {'skill': skillName}
        };
        this.beginRequest();
        return this.executeRequest(axios.get(url, config));
    }
}
