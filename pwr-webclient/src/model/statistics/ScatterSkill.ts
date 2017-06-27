import {doop} from 'doop';

export interface APIScatterSkill {
    name: string;
    occurrences: number;
    meanRating: number;
}

@doop
export class ScatterSkill {
    @doop public get name() {return doop<string, this>()};
    @doop public get occurrences() {return doop<number, this>()};
    @doop public get meanRating() {return doop<number, this>()};

    private constructor(name: string, occurrences: number, meanRating: number) {
        return this.name(name).occurrences(occurrences).meanRating(meanRating);
    }

    public static fromAPI(apiScatterSkill: APIScatterSkill) {
        return new ScatterSkill(apiScatterSkill.name, apiScatterSkill.occurrences, apiScatterSkill.meanRating);
    }
}