import {doop} from 'doop';
import {APISkillCategory} from './SkillCategory';
import {isNullOrUndefined} from 'util';
import {APILocalizedQualifier, LocalizedQualifier} from './LocalizedQualifier';
import * as Immutable from 'immutable';
import {StringUtils} from '../../utils/StringUtil';
import {TSkillNode} from './tree/TSkillNode';

export interface APISkillServiceSkill {
    id: number;
    category: APISkillCategory;
    qualifier: string;
    qualifiers?: Array<APILocalizedQualifier>;
    custom?: boolean;
    versions: string[];
}

@doop
export class SkillServiceSkill {
    @doop
    public get id() {
        return doop<number, this>();
    }

    @doop
    public get qualifier() {
        return doop<string, this>();
    }

    @doop
    public get categoryId() {
        return doop<number, this>();
    }

    @doop
    public get isCustom() {
        return doop<boolean, this>();
    };

    @doop
    public get qualifiers() {
        return doop<Immutable.List<LocalizedQualifier>, this>();
    };

    @doop
    public get versions() {
        return doop<Immutable.List<string>, this>();
    };

    constructor(id: number, qualifier: string, categoryId: number, isCustom: boolean, qualifiers: Immutable.List<LocalizedQualifier>, versions: Immutable.List<string>) {
        return this.id(id).qualifier(qualifier).categoryId(categoryId).isCustom(isCustom).qualifiers(qualifiers).versions(versions);
    }

    public static forQualifier(qualifier: string) {
        return new SkillServiceSkill(-1, qualifier, null, false, Immutable.List<LocalizedQualifier>(), Immutable.List<string>());
    }

    public static fromAPI(api: APISkillServiceSkill) {
        let categoryId = !isNullOrUndefined(api.category) ? api.category.id : null;
        let qualifiers: Array<LocalizedQualifier> = [];
        if (api.qualifiers != null) {
            qualifiers = api.qualifiers.map(apiQualifier => LocalizedQualifier.fromAPI(apiQualifier));
        }
        console.log('fromApi - versions', api.versions);

        return new SkillServiceSkill(api.id,
            api.qualifier,
            categoryId,
            api.custom,
            Immutable.List<LocalizedQualifier>(qualifiers),
            Immutable.List<string>(api.versions));
    }

    public static fromTSkillNode(node: TSkillNode, categoryId: number) {
        let qualifiers = node.qualifiers.map(apiQualifier => LocalizedQualifier.fromAPI(apiQualifier));
        console.log('fromTSkillNode', node.versions);
        return new SkillServiceSkill(node.id,
            node.qualifier,
            categoryId,
            node.custom,
            Immutable.List<LocalizedQualifier>(qualifiers),
            Immutable.List<string>(node.versions));
    }

    public anyFuzzyMatch(searchTerm: string) {
        if (!searchTerm || searchTerm.length <= 0) {
            return true;
        }
        let match = StringUtils.filterFuzzy(searchTerm, this.qualifier());
        this.qualifiers().forEach(qualifier => {
            match = match || StringUtils.filterFuzzy(searchTerm, qualifier.qualifier());
        });
        return match;
    }
}
