import {AbstractAction} from '../profile/database-actions';
import {SkillUsageMetric} from '../../model/statistics/SkillUsageMetric';
import {ProfileSkillMetrics} from '../../model/statistics/ProfileSkillMetrics';
import {Network} from '../../model/statistics/Network';
import {ConsultantClusterInfo} from '../../model/statistics/ConsultantClusterInfo';
import {ScatterSkill} from '../../model/statistics/ScatterSkill';
import {ActionType} from '../ActionType';
import {NameEntity} from '../../model/NameEntity';
import {ConsultantInfo} from '../../model/ConsultantInfo';

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

export interface ReceiveScatterSkillsAction extends AbstractAction {
    scatterSkills: Immutable.List<ScatterSkill>;
}

export class AddNameEntityUsageInfoAction implements AbstractAction {
    type: ActionType;
    nameEntity: NameEntity;
    consultantInfos: Array<ConsultantInfo>;

    constructor(type: ActionType, nameEntity: NameEntity, consultantInfos: Array<ConsultantInfo>) {
        this.type = type;
        this.nameEntity = nameEntity;
        this.consultantInfos = consultantInfos;
    }
}