import {ProfileEntry} from './ProfileEntry';
import {NameEntity} from './NameEntity';
import {LocalDate} from '../../../../utils/DateUtil';

export interface Qualification extends ProfileEntry {
    date: LocalDate;
}


export function newQualification(id: number, nameEntity: NameEntity, date: LocalDate): Qualification {
    return {
        id: id,
        nameEntity: nameEntity,
        date: date
    };
}