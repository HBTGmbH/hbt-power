import * as Immutable from 'immutable';
import {doop} from 'doop';
import {SkillServiceSkill} from './SkillServiceSkill';
import {APILocalizedQualifier, LocalizedQualifier} from './LocalizedQualifier';
import {TCategoryNode} from './tree/TCategoryNode';

export interface APISkillCategory {
    id: number;
    qualifier: string;
    qualifiers: [APILocalizedQualifier];
    category: APISkillCategory;
    blacklisted: boolean;
    custom: boolean;
    display: boolean;
}


@doop
export class SkillCategory {
    @doop public get id() {return doop<number, this>()}

    @doop public get qualifier() {return doop<string, this>()};

    @doop public get qualifiers() {return doop<Immutable.List<LocalizedQualifier>, this>()};

    //@doop public get categories() {return doop<Immutable.List<SkillCategory>, this>()};

    @doop public get skills() {return doop<Immutable.List<SkillServiceSkill>, this>()};

    @doop public get blacklisted() {return doop<boolean, this>()};

    @doop public get isCustom() {return doop<boolean, this>()};

    @doop public get isDisplay() {return doop<boolean, this>()};

    private constructor(id: number, qualifier: string,
                        qualifiers: Immutable.List<LocalizedQualifier>,
                        skills: Immutable.List<SkillServiceSkill>, blacklisted: boolean,
                        isCustom: boolean, isDisplay: boolean) {
        return this.id(id).qualifier(qualifier).qualifiers(qualifiers).skills(skills)
            .blacklisted(blacklisted).isCustom(isCustom).isDisplay(isDisplay);
    }

    public static of(id: number, qualifier: string) {
        return new SkillCategory(id,
            qualifier,
            Immutable.List<LocalizedQualifier>(),
            Immutable.List<SkillServiceSkill>(),
            false,
            false,
            false);
    }

    public static fromAPI(apiSkillCategory: APISkillCategory) {
        let qualifiers: LocalizedQualifier[] = apiSkillCategory.qualifiers.map(value => LocalizedQualifier.fromAPI(value));
        return new SkillCategory(apiSkillCategory.id,
            apiSkillCategory.qualifier,
            Immutable.List<LocalizedQualifier>(qualifiers),
            Immutable.List<SkillServiceSkill>(),
            apiSkillCategory.blacklisted,
            apiSkillCategory.custom,
            apiSkillCategory.display);
    }

    public static fromTCategoryNode(node: TCategoryNode) {
        let qualifiers: LocalizedQualifier[] = node.qualifiers.map(value => LocalizedQualifier.fromAPI(value));
        return new SkillCategory(node.id,
            node.qualifier,
            Immutable.List<LocalizedQualifier>(qualifiers),
            Immutable.List<SkillServiceSkill>(),
            node.blacklisted,
            node.custom,
            node.display);
    }
}