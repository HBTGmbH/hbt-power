import {APINameEntity, APISkill} from '../../../model/APIProfile';
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