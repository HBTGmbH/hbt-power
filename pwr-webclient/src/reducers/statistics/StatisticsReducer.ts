import {StatisticsStore} from '../../model/statistics/StatisticsStore';
import {AbstractAction} from '../profile/database-actions';
import {isNullOrUndefined} from 'util';
import {
    AddNameEntityUsageInfoAction,
    AddSkillUsageInfoAction,
    ReceiveConsultantClusterInfoAction,
    ReceiveNetworkAction,
    ReceiveProfileSkillMetrics,
    ReceiveScatterSkillsAction,
    ReceiveSkillUsageMetricsAction
} from './statistics-actions';
import {SkillUsageMetric} from '../../model/statistics/SkillUsageMetric';
import * as Immutable from 'immutable';
import {ActionType} from '../ActionType';
import {ConsultantInfo} from '../../model/ConsultantInfo';


export class StatisticsReducer {

    public static ReceiveSkillUsageMetrics(store: StatisticsStore, action: ReceiveSkillUsageMetricsAction): StatisticsStore {
        let metrics: Immutable.List<SkillUsageMetric> = Immutable.List<SkillUsageMetric>(action.metrics);
        return store.skillUsages(metrics);
    }

    public static ReceiveRelativeSkillUsageMetrics(store: StatisticsStore, action: ReceiveSkillUsageMetricsAction): StatisticsStore {
        let metrics: Immutable.List<SkillUsageMetric> = Immutable.List<SkillUsageMetric>(action.metrics);
        return store.relativeSkillUsages(metrics);
    }

    public static ReceiveProfileSkillMetrics(store: StatisticsStore, action: ReceiveProfileSkillMetrics): StatisticsStore {
        return store.activeProfileMetric(action.metrics);
    }

    public static ReceiveNetwork(store: StatisticsStore, action: ReceiveNetworkAction): StatisticsStore {
        return store.network(action.network);
    }

    public static ReceiveConsultantClusterInfo(store: StatisticsStore, action: ReceiveConsultantClusterInfoAction): StatisticsStore {
        return store.consultantClusterInfo(action.consultantClusterInfo);
    }

    public static ReceiveScatterSkills(store: StatisticsStore, action: ReceiveScatterSkillsAction) : StatisticsStore {
        return store.scatteredSkills(action.scatterSkills);
    }

    public static AddNameEntityUsageInfo(store: StatisticsStore, action: AddNameEntityUsageInfoAction): StatisticsStore {
        let map = store.nameEntityUsageInfo();
        map = map.set(action.nameEntity, Immutable.List<ConsultantInfo>(action.consultantInfos));
        return store.nameEntityUsageInfo(map);
    }

    public static AddSkillUsageInfo(store: StatisticsStore, action: AddSkillUsageInfoAction): StatisticsStore {
        let map = store.skillUsageInfo();
        map = map.set(action.skillName, Immutable.List<ConsultantInfo>(action.consultantInfos));
        return store.skillUsageInfo(map);
    }

    public static reduce(store: StatisticsStore, action: AbstractAction) : StatisticsStore {
        if(isNullOrUndefined(store)) {
            return StatisticsStore.createEmpty();
        }
        switch(action.type) {
            case ActionType.ReceiveRelativeSkillUsageMetrics:
                return StatisticsReducer.ReceiveRelativeSkillUsageMetrics(store, action as ReceiveSkillUsageMetricsAction);
            case ActionType.ReceiveSkillUsageMetrics:
                return StatisticsReducer.ReceiveSkillUsageMetrics(store, action as ReceiveSkillUsageMetricsAction);
            case ActionType.ReceiveProfileSkillMetrics:
                return StatisticsReducer.ReceiveProfileSkillMetrics(store, action as ReceiveProfileSkillMetrics);
            case ActionType.ReceiveNetwork:
                return StatisticsReducer.ReceiveNetwork(store, action as ReceiveNetworkAction);
            case ActionType.StatisticsAvailable:
                return store.available(true);
            case ActionType.StatisticsNotAvailable:
                return store.available(false);
            case ActionType.ReceiveConsultantClusterInfo:
                return StatisticsReducer.ReceiveConsultantClusterInfo(store,action as ReceiveConsultantClusterInfoAction);
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