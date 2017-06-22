import {AbstractAction} from '../profile/database-actions';
import {APISkillUsageMetric} from '../../model/statistics/ApiMetrics';
import {SkillUsageMetric} from '../../model/statistics/SkillUsageMetric';
import {ProfileSkillMetrics} from '../../model/statistics/ProfileSkillMetrics';
import {Network} from '../../model/statistics/Network';
import {ConsultantClusterInfo} from '../../model/statistics/ConsultantClusterInfo';

export interface ReceiveSkillUsageMetricsAction extends AbstractAction {
    metrics: Array<SkillUsageMetric>;
}

export interface ReceiveProfileSkillMetrics extends AbstractAction {
    metrics: ProfileSkillMetrics;
}

export interface ReceiveNetworkAction extends AbstractAction {
    network: Network;
}

export interface ReceiveConsultantClusterInfoAction extends AbstractAction {
    consultantClusterInfo: ConsultantClusterInfo;
}