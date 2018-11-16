import * as redux from 'redux';
import * as Immutable from 'immutable';
import {ApplicationState} from '../reducerIndex';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {
    getConsultantClusterInfo,
    getKMedProfileNetwork,
    getNameEntityUsageInfo,
    getProfileStatistics,
    getScatterSkills,
    getSkillUsageInfo,
    getSkillUsageRelative,
    getSkillUsagesAbsolute,
    headStatisticsServiceAvailable
} from '../../API_CONFIG';
import {APINetwork, APISkillUsageMetric} from '../../model/statistics/ApiMetrics';
import {SkillUsageMetric} from '../../model/statistics/SkillUsageMetric';
import {
    AddNameEntityUsageInfoAction,
    AddSkillUsageInfoAction,
    ReceiveConsultantClusterInfoAction,
    ReceiveNetworkAction,
    ReceiveProfileSkillMetrics,
    ReceiveScatterSkillsAction,
    ReceiveSkillUsageMetricsAction
} from './statistics-actions';
import {ActionType} from '../ActionType';
import {ProfileSkillMetrics} from '../../model/statistics/ProfileSkillMetrics';
import {Network} from '../../model/statistics/Network';
import {AbstractAction} from '../profile/database-actions';
import {ConsultantClusterInfo} from '../../model/statistics/ConsultantClusterInfo';
import {APIScatterSkill, ScatterSkill} from '../../model/statistics/ScatterSkill';
import {APIConsultant} from '../../model/APIProfile';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {NameEntity} from '../../model/NameEntity';

export class StatisticsActionCreator {

    public static ReceiveSkillUsageMetrics(metrics: Array<SkillUsageMetric>): ReceiveSkillUsageMetricsAction {
        return {
            type: ActionType.ReceiveSkillUsageMetrics,
            metrics: metrics
        };
    }

    public static ReceiveRelativeSkillUsageMetrics(metrics: Array<SkillUsageMetric>): ReceiveSkillUsageMetricsAction {
        return {
            type: ActionType.ReceiveRelativeSkillUsageMetrics,
            metrics: metrics
        };
    }

    public static ReceiveProfileMetrics(metrics: ProfileSkillMetrics): ReceiveProfileSkillMetrics {
        return {
            type: ActionType.ReceiveProfileSkillMetrics,
            metrics: metrics
        };
    }

    public static ReceiveNetwork(network: Network): ReceiveNetworkAction {
        return {
            type: ActionType.ReceiveNetwork,
            network: network
        };
    }

    public static StatisticsAvailable(): AbstractAction {
        return {
            type: ActionType.StatisticsAvailable
        };
    }


    public static StatisticsNotAvailable(): AbstractAction {
        return {
            type: ActionType.StatisticsNotAvailable
        };
    }

    public static ReceiveConsultantClusterInfo(consultantClusterInfo: ConsultantClusterInfo): ReceiveConsultantClusterInfoAction {
        return {
            type: ActionType.ReceiveConsultantClusterInfo,
            consultantClusterInfo: consultantClusterInfo
        };
    }

    public static ReceiveScatterSkills(scatterSkills: Immutable.List<ScatterSkill>): ReceiveScatterSkillsAction {
        return {
            type: ActionType.ReceiveScatterSkills,
            scatterSkills: scatterSkills
        };
    }

    public static AddSkillUsageInfo(skillName: string, consultants: Array<ConsultantInfo>): AddSkillUsageInfoAction {
        return {
            type: ActionType.AddSkillUsageInfo,
            consultantInfos: consultants,
            skillName: skillName
        };
    }

    public static AsyncCheckAvailability() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            axios.head(headStatisticsServiceAvailable()).then((response: AxiosResponse) => {
                dispatch(StatisticsActionCreator.StatisticsAvailable());
            }).catch(error => {
                dispatch(StatisticsActionCreator.StatisticsNotAvailable());
            });
        };
    }

    public static AsyncRequestSkillUsages() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            let config: AxiosRequestConfig = {
                params: {
                    max: 500
                }
            };
            axios.get(getSkillUsagesAbsolute(), config).then(function (response: AxiosResponse) {
                let data: Array<APISkillUsageMetric> = response.data;
                let res: Array<SkillUsageMetric> = data.map(value => SkillUsageMetric.fromAPI(value));
                dispatch(StatisticsActionCreator.ReceiveSkillUsageMetrics(res));
                dispatch(StatisticsActionCreator.StatisticsAvailable());
            }).catch(function (error: any) {
                console.error(error);
                dispatch(StatisticsActionCreator.AsyncCheckAvailability());
            });

            config.params = {
                max: 500
            };
            axios.get(getSkillUsageRelative(), config).then(function (response: AxiosResponse) {
                let data: Array<APISkillUsageMetric> = response.data;
                let res: Array<SkillUsageMetric> = data.map(value => SkillUsageMetric.fromAPI(value));
                dispatch(StatisticsActionCreator.ReceiveRelativeSkillUsageMetrics(res));
                dispatch(StatisticsActionCreator.StatisticsAvailable());
            }).catch(function (error: any) {
                console.error(error);
                dispatch(StatisticsActionCreator.AsyncCheckAvailability());
            });

            dispatch(StatisticsActionCreator.AsyncRequestScatterSkills());
        };
    }

    public static AsyncGetProfileStatistics(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            axios.get(getProfileStatistics(initials)).then(function (response: AxiosResponse) {
                //console.log("statistics data", response.data);
                dispatch(StatisticsActionCreator.ReceiveProfileMetrics(ProfileSkillMetrics.fromAPI(response.data)));
                dispatch(StatisticsActionCreator.StatisticsAvailable());
            }).catch(function (error: any) {
                console.error(error);
                dispatch(StatisticsActionCreator.AsyncCheckAvailability());
            });
        };
    }

    public static AsyncRequestNetwork() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            axios.get(getKMedProfileNetwork()).then((response: AxiosResponse) => {
                let network: Network = Network.fromAPI(response.data as APINetwork);
                dispatch(StatisticsActionCreator.ReceiveNetwork(network));
                dispatch(StatisticsActionCreator.StatisticsAvailable());
            }).catch(function (error: any) {
                console.error(error);
                dispatch(StatisticsActionCreator.AsyncCheckAvailability());
            });
        };
    }

    public static AsyncRequestConsultantClusterInfo(initials: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            axios.get(getConsultantClusterInfo(initials)).then((response: AxiosResponse) => {
                let info: ConsultantClusterInfo = ConsultantClusterInfo.fromAPI(response.data);
                dispatch(StatisticsActionCreator.ReceiveConsultantClusterInfo(info));
                dispatch(StatisticsActionCreator.StatisticsAvailable());
            }).catch(function (error: any) {
                console.error(error);
                dispatch(StatisticsActionCreator.AsyncCheckAvailability());
            });
        };
    }

    public static AsyncRequestScatterSkills() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            axios.get(getScatterSkills()).then((response: AxiosResponse) => {
                let data: Array<APIScatterSkill> = response.data;
                let list = Immutable.List<ScatterSkill>(data.map(value => ScatterSkill.fromAPI(value)));
                dispatch(StatisticsActionCreator.ReceiveScatterSkills(list));
                dispatch(StatisticsActionCreator.StatisticsAvailable());
            }).catch(function (error: any) {
                console.error(error);
                dispatch(StatisticsActionCreator.AsyncCheckAvailability());
            });
        };
    }

    /**
     * Requests name entity info unless the info is already available in the store.
     * @param nameEntity
     * @param type
     * @returns {(dispatch:redux.Dispatch<ApplicationState>, getState:()=>ApplicationState)=>undefined}
     * @constructor
     */
    public static AsyncRequestNameEntityUsageInfo(nameEntity: NameEntity, type: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            let state = getState();
            if (!state.statisticsReducer.nameEntityUsageInfo().has(nameEntity)) {
                let config: AxiosRequestConfig = {
                    params: {
                        'name-entity': nameEntity.name(),
                        'type': type
                    }
                };
                axios.get(getNameEntityUsageInfo(), config).then((response: AxiosResponse) => {
                    let data: Array<APIConsultant> = response.data; // Misses view and profile data; Parse to consultant info
                    let list = data.map(value => ConsultantInfo.fromAPI(value));
                    dispatch(Object.assign({}, new AddNameEntityUsageInfoAction(ActionType.AddNameEntityUsageInfo, nameEntity, list)));
                }).catch(function (error: any) {
                    console.error(error);
                    dispatch(StatisticsActionCreator.AsyncCheckAvailability());
                });
            }
        };
    }

    public static AsyncRequestSkillUsageInfo(skillName: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            let state = getState();
            if (!state.statisticsReducer.skillUsageInfo().has(skillName)) {
                let config: AxiosRequestConfig = {
                    params: {'skill': skillName}
                };
                axios.get(getSkillUsageInfo(), config).then((response: AxiosResponse) => {
                    let data: Array<APIConsultant> = response.data; // Misses view and profile data; Parse to consultant info
                    let list = data.map(value => ConsultantInfo.fromAPI(value));
                    dispatch(StatisticsActionCreator.AddSkillUsageInfo(skillName, list));
                }).catch(function (error: any) {
                    console.error(error);
                    dispatch(StatisticsActionCreator.AsyncCheckAvailability());
                });
            }
        };
    }
}