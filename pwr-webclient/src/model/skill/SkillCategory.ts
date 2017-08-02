import * as Immutable from 'immutable';
import {doop} from 'doop';
import {SkillServiceSkill} from './SkillServiceSkill';
import {Comparators} from '../../utils/Comparators';
import {APILocalizedQualifier, LocalizedQualifier} from './LocalizedQualifier';
export interface APISkillCategory {
    id: number;
    qualifier: string;
    qualifiers: [APILocalizedQualifier];
    category: APISkillCategory;
    blacklisted: boolean;
}


@doop
export class SkillCategory {
    @doop public get id() {return doop<number, this>()}

    @doop public get qualifier() {return doop<string, this>()};

    @doop public get qualifiers() {return doop<Immutable.List<LocalizedQualifier>, this>()};

    @doop public get categories() {return doop<Immutable.List<SkillCategory>, this>()};

    @doop public get skills() {return doop<Immutable.List<SkillServiceSkill>, this>()};

    @doop public get blacklisted() {return doop<boolean, this>()};

    private constructor(id: number, qualifier: string,
                        qualifiers: Immutable.List<LocalizedQualifier>,
                        categories: Immutable.List<SkillCategory>,
                        skills: Immutable.List<SkillServiceSkill>, blacklisted: boolean) {
        return this.id(id).qualifier(qualifier).qualifiers(qualifiers).categories(categories).skills(skills).blacklisted(blacklisted);
    }

    public static of(id: number, qualifier: string) {
        return new SkillCategory(id,
            qualifier,
            Immutable.List<LocalizedQualifier>(),
            Immutable.List<SkillCategory>(),
            Immutable.List<SkillServiceSkill>(), false);
    }

    public static fromAPI(apiSkillCategory: APISkillCategory) {
        let qualifiers: LocalizedQualifier[] = apiSkillCategory.qualifiers.map(value => LocalizedQualifier.fromAPI(value));
        return new SkillCategory(apiSkillCategory.id,
            apiSkillCategory.qualifier,
            Immutable.List<LocalizedQualifier>(qualifiers),
            Immutable.List<SkillCategory>(),
            Immutable.List<SkillServiceSkill>(),
            apiSkillCategory.blacklisted);
    }

    public containsChildCategory(childId: number): boolean {
        return this.categories().some((value, key, iter) => value.id() === childId);
    }

    public getIndex(childId: number): number {
        return this.categories().findIndex((value, index, iter) => value.id() === childId);
    }

    public hasSkill(skill: SkillServiceSkill): boolean {
        return this.skills().some(value => value.id() === skill.id());
    }

    public partialUpdate(category: SkillCategory): SkillCategory {
        return this.blacklisted(category.blacklisted()).qualifiers(category.qualifiers()).qualifier(category.qualifier());
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
        if(this.id() === parentId) {
            let childIndex = this.getIndex(category.id());
            if(childIndex === -1) {
                newCategories = this.categories().push(category);
            } else {
                newCategories = this.categories().remove(childIndex).push(category);
            }
        } else {
            newCategories = this.categories().map(child => child.addCategoryToTree(parentId, category));
        }
        return this.categories(Immutable.List<SkillCategory>(newCategories.sort(Comparators.compareCategories)));
    }


    public updateCategoryInTree(categoryToUpdate: SkillCategory): SkillCategory {
        if(this.id() === categoryToUpdate.id()) {
            return this.partialUpdate(categoryToUpdate);
        } else {
            let newCategories = this.categories().map(child => child.updateCategoryInTree(child)).sort(Comparators.compareCategories);
            return this.categories(Immutable.List<SkillCategory>(newCategories));
        }
    }
}