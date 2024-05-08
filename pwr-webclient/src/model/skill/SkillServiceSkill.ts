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

export class SkillServiceSkill {
    private readonly _id: number;
    private readonly _qualifier: string;
    private readonly _categoryId: number;
    private readonly _isCustom: boolean;
    private readonly _qualifiers: Immutable.List<LocalizedQualifier>;
    private readonly _versions: Immutable.List<string>;

    public id() {
        return this._id;
    }

    public qualifier(): string {
        return this._qualifier;
    }

    public categoryId(): number {
        return this._categoryId;
    }

    public setCategoryId(categoryId: number): SkillServiceSkill {
        return new SkillServiceSkill(this._id, this._qualifier, categoryId, this._isCustom, this._qualifiers, this._versions);
    }

    public isCustom(): boolean {
        return this._isCustom;
    };

    public qualifiers(): Immutable.List<LocalizedQualifier> {
        return this._qualifiers;
    };

    public versions() {
        return this._versions;
    };

    constructor(id: number, qualifier: string, categoryId: number, isCustom: boolean, qualifiers: Immutable.List<LocalizedQualifier>, versions: Immutable.List<string>) {
        this._id = id;
        this._qualifier = qualifier;
        this._categoryId = categoryId;
        this._isCustom = isCustom;
        this._qualifiers = qualifiers;
        this._versions = versions;
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

        return new SkillServiceSkill(api.id,
            api.qualifier,
            categoryId,
            api.custom,
            Immutable.List<LocalizedQualifier>(qualifiers),
            Immutable.List<string>(api.versions));
    }

    public static fromTSkillNode(node: TSkillNode, categoryId: number) {
        let qualifiers = node.qualifiers.map(apiQualifier => LocalizedQualifier.fromAPI(apiQualifier));
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
