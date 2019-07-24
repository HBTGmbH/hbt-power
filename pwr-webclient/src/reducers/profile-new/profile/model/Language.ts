import {ProfileEntry} from './ProfileEntry';
import {NameEntity} from './NameEntity';
import {LanguageLevel} from './LanguageLevel';

export interface Language extends ProfileEntry {
    level: LanguageLevel;
}

export function newLanguage(id: number, nameEntity: NameEntity, level: LanguageLevel): Language {
    return {
        id: id,
        nameEntity: nameEntity,
        level: level
    };
}