import {ProfileEntry} from './ProfileEntry';
import {NameEntity} from './NameEntity';
import {LocalDate} from '../../../../utils/DateUtil';

export interface FurtherTraining extends ProfileEntry {
    startDate: LocalDate;
    endDate: LocalDate;
}

export function newTraining(id: number, nameEntity: NameEntity, startDate: LocalDate, endDate: LocalDate): FurtherTraining {
    return {
        id: id,
        nameEntity: nameEntity,
        startDate: startDate,
        endDate: endDate
    };
}