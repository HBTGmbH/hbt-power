import {ViewProjectRole} from './ViewProjectRole';
import {ViewSkill} from './ViewSkill';
export interface ViewProject {
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