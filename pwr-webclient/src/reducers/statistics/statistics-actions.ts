import {AbstractAction} from '../profile/database-actions';
import {APISkillUsageMetric} from '../../model/statistics/ApiMetrics';
import {SkillUsageMetric} from '../../model/statistics/SkillUsageMetric';
import {ProfileSkillMetrics} from '../../model/statistics/ProfileSkillMetrics';
import {Network} from '../../model/statistics/Network';

export interface ReceiveSkillUsageMetricsAction extends AbstractAction {
    metrics: Array<SkillUsageMetric>;
}

export interface ReceiveProfileSkillMetrics extends AbstractAction {
    metrics: ProfileSkillMetrics;
}

export interface ReceiveNetworkAction extends AbstractAction {
    network: Network;
}