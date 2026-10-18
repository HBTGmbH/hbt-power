import {NameEntity} from './NameEntity';
import {ProfileSkill} from './ProfileSkill';
import {LocalDate, today} from '../../../../utils/DateUtil';

export interface Project {
    id: number;
    name: string;
    description: string;
    endDate: LocalDate;
    startDate: LocalDate;
    broker: NameEntity;
    client: NameEntity;
    skills: Array<ProfileSkill>;
    projectRoles: Array<NameEntity>;
}


export function emptyProject(): Project {
    return {
        id: null,
        name: '',
        description: '',
        endDate: today(),
        startDate: today(),
        broker: null,
        client: null,
        skills: [],
        projectRoles: []
    };
}
