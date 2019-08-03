import {NameEntity} from './NameEntity';
import {ProfileSkill} from './ProfileSkill';

export interface Project {
    id: number;
    name: string;
    description: string;
    endDate: Date;
    startDate: Date;
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
        endDate: new Date(),
        startDate: new Date(),
        broker: null,
        client: null,
        skills: [],
        projectRoles: []
    };
}
