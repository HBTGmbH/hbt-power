import {emptyStatisticsStore, StatisticsStore} from '../../model/statistics/StatisticsStore';
import {
    AddNameEntityUsageInfoAction,
    AddSkillUsageInfoAction,
    ReceiveConsultantClusterInfoAction,
    ReceiveProfileSkillMetrics,
    ReceiveScatterSkillsAction,
    ReceiveSkillUsageMetricsAction
} from './statistics-actions';
import * as Immutable from 'immutable';
import {ActionType} from '../ActionType';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {AbstractAction} from '../BaseActions';
import {APISkillUsageMetric} from '../../model/statistics/ApiMetrics';


export class StatisticsReducer {

    public static ReceiveSkillUsageMetrics(store: StatisticsStore, action: ReceiveSkillUsageMetricsAction): StatisticsStore {
        let metrics: Immutable.List<APISkillUsageMetric> = Immutable.List<APISkillUsageMetric>(action.metrics);
        return {
            ...store,
            skillUsages: metrics
        }
    }

    public static ReceiveRelativeSkillUsageMetrics(store: StatisticsStore, action: ReceiveSkillUsageMetricsAction): StatisticsStore {
        let metrics: Immutable.List<APISkillUsageMetric> = Immutable.List<APISkillUsageMetric>(action.metrics);
        return {
            ...store,
            relativeSkillUsages: metrics,
        }
    }

    public static ReceiveProfileSkillMetrics(store: StatisticsStore, action: ReceiveProfileSkillMetrics): StatisticsStore {
        return {
            ...store,
            activeProfileMetric: action.metrics
        }
    }

    public static ReceiveConsultantClusterInfo(store: StatisticsStore, action: ReceiveConsultantClusterInfoAction): StatisticsStore {
        return {
            ...store,
            consultantClusterInfo: action.consultantClusterInfo
        }
    }

    public static ReceiveScatterSkills(store: StatisticsStore, action: ReceiveScatterSkillsAction): StatisticsStore {
        return {
            ...store,
            scatteredSkills: action.scatterSkills
        }
    }

    public static AddNameEntityUsageInfo(store: StatisticsStore, action: AddNameEntityUsageInfoAction): StatisticsStore {
        let map = store.nameEntityUsageInfo;
        map = map.set(action.nameEntity, Immutable.List<ConsultantInfo>(action.consultantInfos));
        return {
            ...store,
            nameEntityUsageInfo: map
        }
    }

    public static AddSkillUsageInfo(store: StatisticsStore, action: AddSkillUsageInfoAction): StatisticsStore {
        let skillUsageInfo = store.skillUsageInfo;
        skillUsageInfo = skillUsageInfo.set(action.skillName, Immutable.List<ConsultantInfo>(action.consultantInfos));
        return {
            ...store,
            skillUsageInfo,
        }
    }

    public static reduce(store = emptyStatisticsStore(), action: AbstractAction): StatisticsStore {
        switch (action.type) {
            case ActionType.ReceiveRelativeSkillUsageMetrics:
                return StatisticsReducer.ReceiveRelativeSkillUsageMetrics(store, action as ReceiveSkillUsageMetricsAction);
            case ActionType.ReceiveSkillUsageMetrics:
                return StatisticsReducer.ReceiveSkillUsageMetrics(store, action as ReceiveSkillUsageMetricsAction);
            case ActionType.ReceiveProfileSkillMetrics:
                return StatisticsReducer.ReceiveProfileSkillMetrics(store, action as ReceiveProfileSkillMetrics);
            case ActionType.StatisticsAvailable:
                return {
                    ...store,
                    available: true,
                }
            case ActionType.StatisticsNotAvailable:
                return {
                    ...store,
                    available: false,
                }
            case ActionType.ReceiveConsultantClusterInfo:
                return StatisticsReducer.ReceiveConsultantClusterInfo(store, action as ReceiveConsultantClusterInfoAction);
            case ActionType.ReceiveScatterSkills:
                return StatisticsReducer.ReceiveScatterSkills(store, action as ReceiveScatterSkillsAction);
            case ActionType.AddNameEntityUsageInfo:
                return StatisticsReducer.AddNameEntityUsageInfo(store, action as AddNameEntityUsageInfoAction);
            case ActionType.AddSkillUsageInfo:
                return StatisticsReducer.AddSkillUsageInfo(store, action as AddSkillUsageInfoAction);
            default:
                return store;
        }
    }
}
