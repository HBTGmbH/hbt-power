import {doop} from 'doop';
import * as Immutable from 'immutable';
import {Skill} from './Skill';
import {APICategory} from './APIProfile';

@doop
export class SkillCategory {

    @doop
    public get id() {
        return doop<string, this>();
    }

    @doop
    public get name() {
        return doop<string, this>();
    }

    @doop
    public get skillIds() {
        return doop<Immutable.List<string>, this>();
    }

    @doop
    public get categoryIds() {
        return doop<Immutable.List<string>, this>();
    }

    public constructor(id: string, name: string, skillIds: Immutable.List<string>, categoryIds: Immutable.List<string>) {
        return this.id(id).name(name).skillIds(skillIds).categoryIds(categoryIds);
    }

    public static fromAPI(apiCategory: APICategory): SkillCategory {
        let skillIds: Immutable.List<string> = Immutable.List<string>();
        let categoryIds: Immutable.List<string> = Immutable.List<string>();
        apiCategory.categories.forEach(apiCategory => {
            categoryIds = categoryIds.push(String(apiCategory.id));
        });
        apiCategory.skills.forEach(apiSkill => {
            skillIds = skillIds.push(String(apiSkill.id));
        });
        return new SkillCategory(
            String(apiCategory.id),
            apiCategory.name,
            skillIds,
            categoryIds
        )

    }

}