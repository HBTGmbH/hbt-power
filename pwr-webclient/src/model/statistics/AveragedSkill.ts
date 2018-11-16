import {doop} from 'doop';
import {APIAveragedSkill} from './ApiMetrics';

@doop
export class AveragedSkill {
    @doop
    public get name() {
        return doop<string, this>();
    };

    @doop
    public get numberOfOccurrences() {
        return doop<number, this>();
    };

    @doop
    public get averageSkillLevel() {
        return doop<number, this>();
    };

    @doop
    public get relativeOccurrences() {
        return doop<number, this>();
    };

    private constructor(name: string, numberOfOccurrences: number, averageSkillLevel: number, relativeOccurrences: number) {
        return this.name(name).numberOfOccurrences(numberOfOccurrences).averageSkillLevel(averageSkillLevel).relativeOccurrences(relativeOccurrences);
    }

    public static fromAPI(api: APIAveragedSkill): AveragedSkill {
        return new AveragedSkill(api.name, api.numOccurances, api.average, api.relativeOccurance);
    }
}