import {ProfileEntry} from './ProfileEntry';
import {NameEntity} from './NameEntity';

export interface IndustrialSector extends ProfileEntry {

}

export function newIndustrialSector(id: number, nameEntity: NameEntity): IndustrialSector {
    return {
        id: id,
        nameEntity: nameEntity
    };
}