import {NameEntity} from './NameEntity';
import {ProfileSkill} from './ProfileSkill';

export interface Project {
    id: number;
    name: string;
    description: string;
    endDate: string; // TODO Date
    startDate: string; // TODO Date
    broker: NameEntity;
    client: NameEntity;
    skills: Array<ProfileSkill>;
    projectRoles: Array<NameEntity>;
}


export function emptyProject(): Project {
    return {
        id: -1,
        name: '',
        description: '',
        endDate: '',
        startDate: '',
        broker: null,
        client: null,
        skills: [],
        projectRoles: []
    };
}