import {APILocalizedQualifier} from '../LocalizedQualifier';

export interface TSkillNode {
    id: number;
    qualifier: string;
    qualifiers: Array<APILocalizedQualifier>;
    versions: Array<string>;
    aliases?: Array<string>;
    custom: boolean;
}
