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


    constructor(name: string, id: string) {
        return this.name(name).id(id);
    }

    public static fromAPI(apiSkill: APISkill) {
        return new Skill(
            String(apiSkill.name),
            String(apiSkill.id)
        )
    }
}