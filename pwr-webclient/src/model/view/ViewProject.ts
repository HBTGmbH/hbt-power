import {ViewProjectRole} from './ViewProjectRole';
import {ViewSkill} from './ViewSkill';
import {isNullOrUndefined} from 'util';

export class ViewProject {
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


    constructor(id: number, name: string, description: string, client: string, broker: string, startDate: Date,
                endDate: Date, projectRoles: Array<ViewProjectRole>, skills: Array<ViewSkill>, enabled: boolean) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.client = client;
        this.broker = broker;
        this.startDate = startDate;
        this.endDate = endDate;
        this.projectRoles = projectRoles;
        this.skills = skills;
        this.enabled = enabled;
    }

    public static of(viewProject: ViewProject) {
        return new ViewProject(viewProject.id,
            viewProject.name,
            viewProject.description,
            viewProject.client,
            viewProject.broker,
            isNullOrUndefined(viewProject.startDate) ? null : new Date(viewProject.startDate),
            isNullOrUndefined(viewProject.endDate) ? null : new Date(viewProject.endDate),
            viewProject.projectRoles,
            viewProject.skills,
            viewProject.enabled);
    }
}