import {doop} from 'doop';
import * as Immutable from 'immutable';
import {SkillUsageMetric} from './SkillUsageMetric';
import {ProfileSkillMetrics} from './ProfileSkillMetrics';
import {Network} from './Network';
import {ConsultantClusterInfo} from './ConsultantClusterInfo';
import {ScatterSkill} from './ScatterSkill';

@doop
export class StatisticsStore {
    @doop
    public get skillUsages() {return doop<Immutable.List<SkillUsageMetric>, this>()};

    @doop
    public get relativeSkillUsages() {return doop<Immutable.List<SkillUsageMetric>, this>()};

    /**
     * The {@link ProfileSkillMetrics} that is currently active.
     * @returns {Doop<ProfileSkillMetrics, this>}
     */
    @doop
    public get activeProfileMetric() {return doop<ProfileSkillMetrics, this>()};

    @doop
    public get network() {return doop<Network, this>()};

    /**
     * Defines if the service is available or not
     * @returns {Doop<boolean, StatisticsStore>}
     */
    @doop
    public get available() {return doop<boolean, this>()};

    @doop
    public get consultantClusterInfo() {return doop<ConsultantClusterInfo, this>()};

    @doop
    public get scatteredSkills() {return doop<Immutable.List<ScatterSkill>, this>()};

    private constructor(skillUsages: Immutable.List<SkillUsageMetric>,
                        relativeSkillUsages: Immutable.List<SkillUsageMetric>,
                        activeProfileMetric: ProfileSkillMetrics,
                        network: Network,
                        available: boolean,
                        consultantClusterInfo: ConsultantClusterInfo,
                        scatteredSkills: Immutable.List<ScatterSkill>
    ) {
        return this.skillUsages(skillUsages)
            .relativeSkillUsages(relativeSkillUsages)
            .activeProfileMetric(activeProfileMetric)
            .network(network)
            .available(available)
            .consultantClusterInfo(consultantClusterInfo)
            .scatteredSkills(scatteredSkills);
    }

    public static createEmpty(): StatisticsStore {
        return new StatisticsStore(Immutable.List<SkillUsageMetric>(),Immutable.List<SkillUsageMetric>(), null, null,
            false, null, Immutable.List<ScatterSkill>());
    }
}