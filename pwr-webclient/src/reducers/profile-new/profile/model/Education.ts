import {ProfileEntry} from './ProfileEntry';
import {NameEntity} from './NameEntity';
import {LocalDate} from '../../../../utils/DateUtil';

export interface Education extends ProfileEntry {
    startDate: LocalDate;
    endDate: LocalDate;
    degree: string;
}


export function newEducation(id: number, nameEntity: NameEntity, startDate: LocalDate, endDate: LocalDate, degree: string): Education {
    return {
        id: id,
        nameEntity: nameEntity,
        startDate: startDate,
        endDate: endDate,
        degree: degree
    };
}