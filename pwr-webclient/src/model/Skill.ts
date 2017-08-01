import {doop} from 'doop';
import {APISkill} from './APIProfile';
import {NEW_ENTITY_PREFIX} from './PwrConstants';
import {isNullOrUndefined} from 'util';
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

    @doop
    public get comment() {
        return doop<string, this>();
    }

    @doop
    public get isNew() {
        return doop<boolean, this>();
    }


    private static CURRENT_ID: number = 0;


    constructor(name: string, id: string, rating: number, comment: string, isNew: boolean) {
        return this.name(name).id(id).rating(rating).comment(comment).isNew(isNew);
    }

    public toAPI(): APISkill {
        return {
            id: this.isNew() ? null : this.id(),
            name: this.name(),
            rating: this.rating(),
            comment: this.comment()
        }
    }

    public static createNew(qualifier: string): Skill {
        return new Skill(qualifier, NEW_ENTITY_PREFIX + String(Skill.CURRENT_ID++), 1,"", true);
    }

    public static of(name: string, level: number, comment?: string): Skill {
        let _comment = isNullOrUndefined(comment) ? "" : comment;
        return new Skill(name, NEW_ENTITY_PREFIX + String(Skill.CURRENT_ID++), level, _comment, true);
    }

    public static fromAPI(apiSkill: APISkill) {
        return new Skill(
            String(apiSkill.name),
            String(apiSkill.id),
            Number(apiSkill.rating),
            apiSkill.comment,
            false
        )
    }
}