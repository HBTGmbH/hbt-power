import * as Immutable from 'immutable';
import {doop} from 'doop';
import {SkillServiceSkill} from './SkillServiceSkill';
import {Comparators} from '../../utils/Comparators';
export interface APISkillCategory {
    id: number;
    qualifier: string;
    category: APISkillCategory;
}


@doop
export class SkillCategory {
    @doop public get id() {return doop<number, this>()}

    @doop public get qualifier() {return doop<string, this>()};

    @doop public get categories() {return doop<Immutable.List<SkillCategory>, this>()};

    @doop public get skills() {return doop<Immutable.List<SkillServiceSkill>, this>()};

    private constructor(id: number, qualifier: string, categories: Immutable.List<SkillCategory>, skills: Immutable.List<SkillServiceSkill>) {
        return this.id(id).qualifier(qualifier).categories(categories).skills(skills);
    }

    public static of(id: number, qualifier: string) {
        return new SkillCategory(id, qualifier, Immutable.List<SkillCategory>(), Immutable.List<SkillServiceSkill>());
    }

    public static fromAPI(apiSkillCategory: APISkillCategory) {
        return new SkillCategory(apiSkillCategory.id, apiSkillCategory.qualifier, Immutable.List<SkillCategory>(), Immutable.List<SkillServiceSkill>());
    }

    public containsChildCategory(childId: number): boolean {
        return this.categories().some((value, key, iter) => value.id() === childId);
    }

    public hasSkill(skill: SkillServiceSkill): boolean {
        return this.skills().some(value => value.id() === skill.id());
    }

    public addSkillToTree(categoryId: number, skill: SkillServiceSkill): SkillCategory {
        if(categoryId === this.id() && !this.hasSkill(skill)) {
            return this.skills(this.skills().push(skill));
        } else {
            let newCategories = this.categories().map(child => child.addSkillToTree(categoryId, skill)).sort(Comparators.compareCategories);
            return this.categories(Immutable.List<SkillCategory>(newCategories));
        }
    }

    public addCategoryToTree(parentId: number, category: SkillCategory): SkillCategory {
        let newCategories;
        if(this.id() === parentId && !this.containsChildCategory(category.id())) {
            newCategories = this.categories().push(category);
        } else {
            newCategories = this.categories().map(child => child.addCategoryToTree(parentId, category));
        }
        return this.categories(Immutable.List<SkillCategory>(newCategories.sort(Comparators.compareCategories)));
    }
}