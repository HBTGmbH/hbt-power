import * as Immutable from 'immutable';
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


export class SkillCategory {
    public readonly id: number;
    public readonly qualifier: string;
    public readonly qualifiers: Immutable.List<LocalizedQualifier>;
    public readonly skills: Immutable.List<SkillServiceSkill>;
    public readonly blacklisted: boolean;
    public readonly isCustom: boolean;
    public readonly isDisplay: boolean;


    private constructor(id: number, qualifier: string,
                        qualifiers: Immutable.List<LocalizedQualifier>,
                        skills: Immutable.List<SkillServiceSkill>, blacklisted: boolean,
                        isCustom: boolean, isDisplay: boolean) {
        this.id = id;
        this.qualifier = qualifier;
        this.qualifiers = qualifiers;
        this.skills = skills;
        this.blacklisted = blacklisted;
        this.isCustom = isCustom;
        this.isDisplay = isDisplay;
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
