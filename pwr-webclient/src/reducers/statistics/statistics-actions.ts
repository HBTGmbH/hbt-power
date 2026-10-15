import {APIScatterSkill} from '../../model/statistics/ScatterSkill';
import {ActionType} from '../ActionType';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import * as Immutable from 'immutable';
import {NameEntity} from '../profile-new/profile/model/NameEntity';
import {AbstractAction} from '../BaseActions';
import {APIConsultantClusterInfo, APIProfileSkillMetric, APISkillUsageMetric} from '../../model/statistics/ApiMetrics';

export interface ReceiveSkillUsageMetricsAction extends AbstractAction {
    metrics: Array<APISkillUsageMetric>;
}

export interface ReceiveProfileSkillMetrics extends AbstractAction {
    metrics: APIProfileSkillMetric;
}

export interface ReceiveConsultantClusterInfoAction extends AbstractAction {
    consultantClusterInfo: APIConsultantClusterInfo;
}

export interface ReceiveScatterSkillsAction extends AbstractAction {
    scatterSkills: Immutable.List<APIScatterSkill>;
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

export interface AddSkillUsageInfoAction extends AbstractAction {
    type: ActionType;
    skillName: string;
    consultantInfos: Array<ConsultantInfo>;
}
