import {ProfileEntry} from './ProfileEntry';
import {NameEntity} from './NameEntity';

export interface Education extends ProfileEntry {
    startDate: Date;
    endDate: Date;
    degree: string;
}


export function newEducation(id: number, nameEntity: NameEntity, startDate: Date, endDate: Date, degree: string): Education {
    return {
        id: id,
        nameEntity: nameEntity,
        startDate: startDate,
        endDate: endDate,
        degree: degree
    };
}