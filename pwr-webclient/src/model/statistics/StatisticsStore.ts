import * as Immutable from 'immutable';
import {APIScatterSkill} from './ScatterSkill';
import {ConsultantInfo} from '../ConsultantInfo';
import {NameEntity} from '../../reducers/profile-new/profile/model/NameEntity';
import {APIConsultantClusterInfo, APIProfileSkillMetric, APISkillUsageMetric} from './ApiMetrics';

export interface StatisticsStore {
    skillUsages: Immutable.List<APISkillUsageMetric>;
    relativeSkillUsages: Immutable.List<APISkillUsageMetric>;
    activeProfileMetric: APIProfileSkillMetric;
    available: boolean;
    consultantClusterInfo: APIConsultantClusterInfo;
    scatteredSkills: Immutable.List<APIScatterSkill>;
    nameEntityUsageInfo: Immutable.Map<NameEntity, Immutable.List<ConsultantInfo>>;
    skillUsageInfo: Immutable.Map<string, Immutable.List<ConsultantInfo>>;
}

export function emptyStatisticsStore(): StatisticsStore {
    return {
        skillUsages: Immutable.List<APISkillUsageMetric>(),
        activeProfileMetric: null,
        available: false,
        consultantClusterInfo: null,
        nameEntityUsageInfo: Immutable.Map<NameEntity, Immutable.List<ConsultantInfo>>(),
        relativeSkillUsages: Immutable.List<APISkillUsageMetric>(),
        scatteredSkills: Immutable.List<APIScatterSkill>(),
        skillUsageInfo: Immutable.Map<string, Immutable.List<ConsultantInfo>>()
    }
}
