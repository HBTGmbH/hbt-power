import {doop} from 'doop';
import {APISkill} from './APIProfile';
import {NEW_ENTITY_PREFIX} from './PwrConstants';
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

    private static CURRENT_ID: number = 0;


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

    public static createNew(qualifier: string): Skill {
        return new Skill(qualifier, NEW_ENTITY_PREFIX + String(Skill.CURRENT_ID++), 1);
    }

    public static fromAPI(apiSkill: APISkill) {
        return new Skill(
            String(apiSkill.name),
            String(apiSkill.id),
            Number(apiSkill.rating)
        )
    }
}