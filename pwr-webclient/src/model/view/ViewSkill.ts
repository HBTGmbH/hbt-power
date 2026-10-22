import {ViewSkillVersion} from './ViewSkillVersion';

export class ViewSkill {
    id: number;
    name: string;
    /** The name in the language of the view profile (#174), missing without a language or a localization */
    localizedName?: string;
    rating: number;
    enabled: boolean;
    versions: Array<ViewSkillVersion>;
}
