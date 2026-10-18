import {ProfileEntry} from './ProfileEntry';
import {NameEntity} from './NameEntity';
import {LocalDate} from '../../../../utils/DateUtil';

export interface Career extends ProfileEntry {
    startDate: LocalDate;
    endDate: LocalDate;
}


export function newCareer(id: number, nameEntity: NameEntity, startDate: LocalDate, endDate: LocalDate): Career {
    return {
        id: id,
        nameEntity: nameEntity,
        startDate: startDate,
        endDate: endDate
    };
}