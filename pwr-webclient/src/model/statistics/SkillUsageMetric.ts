
import {doop} from 'doop';
import {Skill} from '../Skill';
import {APISkillUsageMetric} from './ApiMetrics';
@doop
export class SkillUsageMetric {
    @doop
    public get skillName() {return doop<string, this>()};

    @doop
    public get skillUsage() {return doop<number, this>()};

    private constructor(skillName: string, skillUsage: number) {
        return this.skillName(skillName).skillUsage(skillUsage);
    }

    public static create(name: string, usage: number): SkillUsageMetric {
        return new SkillUsageMetric(name, usage);
    }

    public static fromAPI(apiSkillUsageMetric: APISkillUsageMetric): SkillUsageMetric {
        return new SkillUsageMetric(apiSkillUsageMetric.name, apiSkillUsageMetric.value);
    }
}