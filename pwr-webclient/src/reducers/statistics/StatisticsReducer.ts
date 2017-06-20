import {StatisticsStore} from '../../model/statistics/StatisticsStore';
import {AbstractAction} from '../profile/database-actions';
import {isNullOrUndefined} from 'util';
import {ReceiveNetworkAction, ReceiveProfileSkillMetrics, ReceiveSkillUsageMetricsAction} from './statistics-actions';
import {SkillUsageMetric} from '../../model/statistics/SkillUsageMetric';
import * as Immutable from 'immutable';
import {ActionType} from '../ActionType';

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

    public static reduce(store: StatisticsStore, action: AbstractAction) : StatisticsStore {
        console.log("Statistics Reducer called with action type " + ActionType[action.type]);
        if(isNullOrUndefined(store)) return StatisticsStore.createEmpty();
        switch(action.type) {
            case ActionType.ReceiveRelativeSkillUsageMetrics:
                return StatisticsReducer.ReceiveRelativeSkillUsageMetrics(store, action as ReceiveSkillUsageMetricsAction);
            case ActionType.ReceiveSkillUsageMetrics:
                return StatisticsReducer.ReceiveSkillUsageMetrics(store, action as ReceiveSkillUsageMetricsAction);
            case ActionType.ReceiveProfileSkillMetrics:
                return StatisticsReducer.ReceiveProfileSkillMetrics(store, action as ReceiveProfileSkillMetrics);
            case ActionType.ReceiveNetwork:
                return StatisticsReducer.ReceiveNetwork(store, action as ReceiveNetworkAction);
            default:
                return store;
        }
    }
}