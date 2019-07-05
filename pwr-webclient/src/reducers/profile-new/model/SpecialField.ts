import {ProfileEntry} from './ProfileEntry';
import {NameEntity} from './NameEntity';

export interface SpecialField extends ProfileEntry {

}


export function newSpecialField(id: number, nameEntity: NameEntity): SpecialField {
    return {
        id: id,
        nameEntity: nameEntity
    };
}