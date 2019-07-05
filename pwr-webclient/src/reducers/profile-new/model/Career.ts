import {ProfileEntry} from './ProfileEntry';
import {NameEntity} from './NameEntity';

export interface Career extends ProfileEntry {
    startDate: Date;
    endDate: Date;
}


export function newCareer(id: number, nameEntity: NameEntity, startDate: Date, endDate: Date): Career {
    return {
        id: id,
        nameEntity: nameEntity,
        startDate: startDate,
        endDate: endDate
    };
}