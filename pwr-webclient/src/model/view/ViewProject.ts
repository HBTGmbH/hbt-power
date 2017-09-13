import {ViewProjectRole} from './ViewProjectRole';
import {ViewSkill} from './ViewSkill';
export interface ViewProject {
    id: number;
    name: string;
    description: string;
    client: string;
    broker: string;
    startDate: Date;
    endDate: Date;
    projectRoles: Array<ViewProjectRole>;
    skills: Array<ViewSkill>;
    enabled: boolean;
}