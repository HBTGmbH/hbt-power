import {ProfileEntry} from './ProfileEntry';
import {NameEntity} from './NameEntity';

export interface Language extends ProfileEntry {
    level: string;
}

export function newLanguage(id: number, nameEntity: NameEntity, level: string): Language {
    return {
        id: id,
        nameEntity: nameEntity,
        level: level
    };
}