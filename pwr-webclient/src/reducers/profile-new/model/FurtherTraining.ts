import {ProfileEntry} from './ProfileEntry';
import {Career} from './Career';
import {NameEntity} from './NameEntity';

export interface FurtherTraining extends ProfileEntry {
    startDate: Date;
    endDate: Date;
}

export function newTraining(id: number, nameEntity: NameEntity, startDate: Date, endDate: Date): FurtherTraining {
    return {
        id: id,
        nameEntity: nameEntity,
        startDate: startDate,
        endDate: endDate
    };
}