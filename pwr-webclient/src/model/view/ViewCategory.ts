import {ViewSkill} from './ViewSkill';

export interface ViewCategory {
    id: number;
    name: string;
    enabled: boolean;
    displaySkills: Array<ViewSkill>;
}