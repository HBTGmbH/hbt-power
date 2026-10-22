import {APILocalizedQualifier} from '../LocalizedQualifier';
import {TSkillNode} from './TSkillNode';

export interface TCategoryNode {
    id: number;
    qualifier: string;
    custom: boolean;
    display: boolean;
    qualifiers: Array<APILocalizedQualifier>;
    childCategories: Array<TCategoryNode>;
    childSkills: Array<TSkillNode>;
}