import {doop} from 'doop';
import * as Immutable from 'immutable';
import {SkillUsageMetric} from './SkillUsageMetric';
import {ProfileSkillMetrics} from './ProfileSkillMetrics';

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

    private constructor(skillUsages: Immutable.List<SkillUsageMetric>,
                        relativeSkillUsages: Immutable.List<SkillUsageMetric>,
                        activeProfileMetric: ProfileSkillMetrics
    ) {
        return this.skillUsages(skillUsages).relativeSkillUsages(relativeSkillUsages).activeProfileMetric(activeProfileMetric);
    }

    public static createEmpty(): StatisticsStore {
        return new StatisticsStore(Immutable.List<SkillUsageMetric>(),Immutable.List<SkillUsageMetric>(), null);
    }
}