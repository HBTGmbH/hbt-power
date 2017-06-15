import {doop} from 'doop';
import * as Immutable from 'immutable';
import {APIProfileSkillMetric} from './ApiMetrics';

@doop
export class ProfileSkillMetrics {
    @doop
    public get commonSkills() {return doop<Immutable.List<string>, this>()};

    @doop
    public get missingSkills() {return doop<Immutable.List<string>, this>()};

    private constructor(commonSkills: Immutable.List<string>, missingSkills: Immutable.List<string>) {
        this.commonSkills(commonSkills).missingSkills(missingSkills);
    }

    public static fromAPI(api: APIProfileSkillMetric): ProfileSkillMetrics {
        let common: Immutable.List<string> = Immutable.List<string>(api.common);
        let missing: Immutable.List<string> = Immutable.List<string>(api.missing);
        return new ProfileSkillMetrics(common, missing);
    };
}