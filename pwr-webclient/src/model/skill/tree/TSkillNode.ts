import {APILocalizedQualifier} from '../LocalizedQualifier';

export interface TSkillNode {
    id: number;
    qualifier: string;
    qualifiers: Array<APILocalizedQualifier>;
    custom: boolean;
}