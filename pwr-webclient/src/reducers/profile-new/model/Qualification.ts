import {ProfileEntry} from './ProfileEntry';
import {NameEntity} from './NameEntity';

export interface Qualification extends ProfileEntry {
    date: Date;
}


export function newQualification(id: number, nameEntity: NameEntity, date: Date): Qualification {
    return {
        id: id,
        nameEntity: nameEntity,
        date: date
    };
}