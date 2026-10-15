import {APISkill} from './APIProfile';
import {NEW_ENTITY_PREFIX} from './PwrConstants';

export class Skill {
    private readonly _id: string;
    private readonly _name: string;
    private readonly _rating: number;
    private readonly _comment: string;
    private readonly _isNew: boolean;

    public id() {
        return this._id;
    }

    public name() {
        return this._name;
    }

    public rating() {
        return this._rating;
    }

    public comment() {
        return this._comment;
    }

    public isNew() {
        return this._isNew;
    }


    private static CURRENT_ID: number = 0;


    constructor(name: string, id: string, rating: number, comment: string, isNew: boolean) {
        this._id = id;
        this._name = name;
        this._rating = rating;
        this._comment = comment;
        this._isNew = isNew;
    }

    public toAPI(): APISkill {
        return {
            id: this.isNew() ? null : this.id(),
            name: this.name(),
            rating: this.rating(),
            comment: this.comment()
        };
    }

    public static createNew(qualifier: string): Skill {
        return new Skill(qualifier, NEW_ENTITY_PREFIX + String(Skill.CURRENT_ID++), 1, '', true);
    }

    public static of(name: string, level: number, comment?: string): Skill {
        let _comment = comment ?? '';
        return new Skill(name, NEW_ENTITY_PREFIX + String(Skill.CURRENT_ID++), level, _comment, true);
    }

    public static fromAPI(apiSkill: APISkill) {
        return new Skill(
            String(apiSkill.name),
            String(apiSkill.id),
            Number(apiSkill.rating),
            apiSkill.comment,
            false
        );
    }
}
