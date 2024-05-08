import * as Immutable from 'immutable';
import {SkillUsageMetric} from './SkillUsageMetric';
import {ProfileSkillMetrics} from './ProfileSkillMetrics';
import {ConsultantClusterInfo} from './ConsultantClusterInfo';
import {ScatterSkill} from './ScatterSkill';
import {ConsultantInfo} from '../ConsultantInfo';
import {NameEntity} from '../../reducers/profile-new/profile/model/NameEntity';

export interface StatisticsStore {
    skillUsages: Immutable.List<SkillUsageMetric>;
    relativeSkillUsages: Immutable.List<SkillUsageMetric>;
    activeProfileMetric: ProfileSkillMetrics;
    available: boolean;
    consultantClusterInfo: ConsultantClusterInfo;
    scatteredSkills: Immutable.List<ScatterSkill>;
    nameEntityUsageInfo: Immutable.Map<NameEntity, Immutable.List<ConsultantInfo>>;
    skillUsageInfo: Immutable.Map<string, Immutable.List<ConsultantInfo>>;
}

export function emptyStatisticsStore(): StatisticsStore {
    return {
        skillUsages: Immutable.List<SkillUsageMetric>(),
        activeProfileMetric: null,
        available: false,
        consultantClusterInfo: null,
        nameEntityUsageInfo: Immutable.Map<NameEntity, Immutable.List<ConsultantInfo>>(),
        relativeSkillUsages: Immutable.List<SkillUsageMetric>(),
        scatteredSkills: Immutable.List<ScatterSkill>(),
        skillUsageInfo: Immutable.Map<string, Immutable.List<ConsultantInfo>>()
    }
}
