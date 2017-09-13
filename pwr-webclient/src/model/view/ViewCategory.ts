import {ViewSkill} from './ViewSkill';
export interface ViewCategory {
    name: string;
    enabled: boolean;
    skills: Array<ViewSkill>;
    displaySkills: Array<ViewSkill>;
    children: Array<ViewCategory>;
}