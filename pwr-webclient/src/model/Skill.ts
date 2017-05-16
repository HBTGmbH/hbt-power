import {doop} from 'doop';
import {APISkill} from './APIProfile';
@doop
export class Skill {
    @doop
    public get id() {
        return doop<string, this>();
    }

    @doop
    public get name() {
        return doop<string, this>();
    }

    @doop
    public get rating() {
        return doop<number, this>();
    }


    constructor(name: string, id: string, rating: number) {
        return this.name(name).id(id).rating(rating);
    }

    public toAPI(): APISkill {
        return {
            id: this.id(),
            name: this.name(),
            rating: this.rating()
        }
    }

    public static fromAPI(apiSkill: APISkill) {
        return new Skill(
            String(apiSkill.name),
            String(apiSkill.id),
            Number(apiSkill.rating)
        )
    }
}