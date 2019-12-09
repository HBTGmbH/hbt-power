import {ViewSkillVersion} from './ViewSkillVersion';

export class ViewSkill {
    id: number;
    name: string;
    rating: number;
    enabled: boolean;
    versions: Array<ViewSkillVersion>;
}
