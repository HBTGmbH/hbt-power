import {doop} from 'doop';
import {APISkillCategory} from './SkillCategory';
import {isNullOrUndefined} from 'util';

export interface APISkillServiceSkill {
    id: number;
    category: APISkillCategory;
    qualifier: string;
    custom?: boolean;
}

@doop
export class SkillServiceSkill {
    @doop public get id() {return doop<number, this>()}
    @doop public get qualifier() {return doop<string, this>()}
    @doop public get categoryId() {return doop<number, this>()}
    @doop public get isCustom() {return doop<boolean, this>()};

    constructor(id: number, qualifier: string, categoryId: number, isCustom: boolean) {
        return this.id(id).qualifier(qualifier).categoryId(categoryId).isCustom(isCustom);
    }

    public static forQualifier(qualifier: string) {
        return new SkillServiceSkill(-1, qualifier, null, false);
    }

    public static fromAPI(api: APISkillServiceSkill) {
        let categoryId = !isNullOrUndefined(api.category) ? api.category.id : null;
        return new SkillServiceSkill(api.id, api.qualifier, categoryId, api.custom);
    }
}