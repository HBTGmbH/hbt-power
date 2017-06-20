import * as redux from 'redux';
import {AllConsultantsState, ApplicationState} from '../../Store';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {getProfileNetwork, getProfileStatistics, getSkillUsages} from '../../API_CONFIG';
import {APINetwork, APISkillUsageMetric} from '../../model/statistics/ApiMetrics';
import {SkillUsageMetric} from '../../model/statistics/SkillUsageMetric';
import {ReceiveNetworkAction, ReceiveProfileSkillMetrics, ReceiveSkillUsageMetricsAction} from './statistics-actions';
import {ActionType} from '../ActionType';
import {ProfileSkillMetrics} from '../../model/statistics/ProfileSkillMetrics';
import {Network} from '../../model/statistics/Network';

export class StatisticsActionCreator {

    public static ReceiveSkillUsageMetrics(metrics: Array<SkillUsageMetric>): ReceiveSkillUsageMetricsAction {
        return {
            type: ActionType.ReceiveSkillUsageMetrics,
            metrics: metrics
        }
    }

    public static ReceiveRelativeSkillUsageMetrics(metrics: Array<SkillUsageMetric>): ReceiveSkillUsageMetricsAction {
        return {
            type: ActionType.ReceiveRelativeSkillUsageMetrics,
            metrics: metrics
        }
    }

    public static ReceiveProfileMetrics(metrics: ProfileSkillMetrics): ReceiveProfileSkillMetrics {
        return {
            type: ActionType.ReceiveProfileSkillMetrics,
            metrics: metrics
        }
    }

    public static ReceiveNetwork(network: Network): ReceiveNetworkAction {
        return {
            type: ActionType.ReceiveNetwork,
            network: network
        }
    }


    public static AsyncRequestSkillUsages() {
        return function(dispatch: redux.Dispatch<ApplicationState>) {
            let config: AxiosRequestConfig = {
                params: {
                    max: 50
                }
            };
            axios.get(getSkillUsages(), config).then(function(response: AxiosResponse) {
                let data: Array<APISkillUsageMetric> = response.data;
                let res: Array<SkillUsageMetric> = data.map(value => SkillUsageMetric.fromAPI(value));
                dispatch(StatisticsActionCreator.ReceiveSkillUsageMetrics(res));
            }).catch(function(error:any) {
                console.error(error);
            });
            config.params = {
                max: 50,
                relative: true
            };
            axios.get(getSkillUsages(), config).then(function(response: AxiosResponse) {
                let data: Array<APISkillUsageMetric> = response.data;
                let res: Array<SkillUsageMetric> = data.map(value => SkillUsageMetric.fromAPI(value));
                dispatch(StatisticsActionCreator.ReceiveRelativeSkillUsageMetrics(res));
            }).catch(function(error:any) {
                console.error(error);
            });
        };
    }

    public static AsyncGetProfileStatistics(initials: string) {
        return function(dispatch: redux.Dispatch<ApplicationState>) {
            axios.get(getProfileStatistics(initials)).then(function (response: AxiosResponse) {
                dispatch(StatisticsActionCreator.ReceiveProfileMetrics(ProfileSkillMetrics.fromAPI(response.data)));
            }).catch(function(error:any) {
                console.error(error);
            });
        }
    }

    public static AsyncRequestNetwork() {
        return function(dispatch: redux.Dispatch<ApplicationState>) {
            let config: AxiosRequestConfig = {
                params: {
                    method: "kmedoid",
                    iterations: 3000
                }
            };
            axios.get(getProfileNetwork(), config).then((response: AxiosResponse) => {
                let network: Network = Network.fromAPI(response.data as APINetwork);
                dispatch(StatisticsActionCreator.ReceiveNetwork(network));
            }).catch(function(error:any) {
                console.error(error);
            });
        }
    }
}