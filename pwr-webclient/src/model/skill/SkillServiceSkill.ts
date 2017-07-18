import {doop} from 'doop';
import {APISkillCategory} from './SkillCategory';

export interface APISkillServiceSkill {
    id: number;
    category: APISkillCategory;
    qualifier: string;
}

@doop
export class SkillServiceSkill {
    @doop public get id() {return doop<number, this>()}
    @doop public get qualifier() {return doop<string, this>()}
    @doop public get categoryId() {return doop<number, this>()}

    constructor(id: number, qualifier: string, categoryId: number) {
        return this.id(id).qualifier(qualifier).categoryId(categoryId);
    }

    public static fromAPI(api: APISkillServiceSkill) {
        return new SkillServiceSkill(api.id, api.qualifier, api.category.id);
    }
}