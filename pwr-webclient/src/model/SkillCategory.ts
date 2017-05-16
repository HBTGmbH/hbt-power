import {doop} from 'doop';
import * as Immutable from 'immutable';
import {Skill} from './Skill';
import {APICategory, APISkill} from './APIProfile';
import {Profile} from './Profile';

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

    public toAPI(profile: Profile): APICategory {
        let apiCategories: Array<APICategory> = [];
        let apiSkills: Array<APISkill> = [];
        this.categoryIds().forEach(id => {
            apiCategories.push(profile.getCategory(id).toAPI(profile));
        });
        this.skillIds().forEach(id => {
            apiSkills.push(profile.getSkill(id).toAPI())
        });

        return {
            id: this.id(),
            name: this.name(),
            categories: apiCategories,
            skills: apiSkills
        }
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