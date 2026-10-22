import {ViewSkill} from './ViewSkill';

export interface ViewCategory {
    id: number;
    name: string;
    /** The name in the language of the view profile (#174) */
    localizedName?: string;
    enabled: boolean;
    displaySkills: Array<ViewSkill>;
}