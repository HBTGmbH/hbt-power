import * as Immutable from 'immutable';
import {doop} from 'doop';
import {SkillServiceSkill} from './SkillServiceSkill';
import {APILocalizedQualifier, LocalizedQualifier} from './LocalizedQualifier';
export interface APISkillCategory {
    id: number;
    qualifier: string;
    qualifiers: [APILocalizedQualifier];
    category: APISkillCategory;
    blacklisted: boolean;
    custom: boolean;
}


@doop
export class SkillCategory {
    @doop public get id() {return doop<number, this>()}

    @doop public get qualifier() {return doop<string, this>()};

    @doop public get qualifiers() {return doop<Immutable.List<LocalizedQualifier>, this>()};

    @doop public get categories() {return doop<Immutable.List<SkillCategory>, this>()};

    @doop public get skills() {return doop<Immutable.List<SkillServiceSkill>, this>()};

    @doop public get blacklisted() {return doop<boolean, this>()};

    @doop public get isCustom() {return doop<boolean, this>()};

    private constructor(id: number, qualifier: string,
                        qualifiers: Immutable.List<LocalizedQualifier>,
                        categories: Immutable.List<SkillCategory>,
                        skills: Immutable.List<SkillServiceSkill>, blacklisted: boolean,
                        isCustom: boolean) {
        return this.id(id).qualifier(qualifier).qualifiers(qualifiers).categories(categories).skills(skills)
            .blacklisted(blacklisted).isCustom(isCustom);
    }

    public static of(id: number, qualifier: string) {
        return new SkillCategory(id,
            qualifier,
            Immutable.List<LocalizedQualifier>(),
            Immutable.List<SkillCategory>(),
            Immutable.List<SkillServiceSkill>(),
            false,
            false);
    }

    public static fromAPI(apiSkillCategory: APISkillCategory) {
        let qualifiers: LocalizedQualifier[] = apiSkillCategory.qualifiers.map(value => LocalizedQualifier.fromAPI(value));
        return new SkillCategory(apiSkillCategory.id,
            apiSkillCategory.qualifier,
            Immutable.List<LocalizedQualifier>(qualifiers),
            Immutable.List<SkillCategory>(),
            Immutable.List<SkillServiceSkill>(),
            apiSkillCategory.blacklisted,
            apiSkillCategory.custom);
    }
}