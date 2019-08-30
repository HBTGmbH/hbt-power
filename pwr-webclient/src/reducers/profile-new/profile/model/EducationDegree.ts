import {LanguageLevel} from './LanguageLevel';

export enum EducationDegree {
    BACHELOR = 'Bachelor',
    MASTER = 'Master',
    DOKTOR = 'Doktor',
    DIPLOM = 'Diplom'
}

export function toDegree(name: string): EducationDegree {
    switch (name) {
        case 'Bachelor':
            return EducationDegree.BACHELOR;
        case 'Master':
            return EducationDegree.MASTER;
        case 'Doktor':
            return EducationDegree.DOKTOR;
        case 'Diplom':
            return EducationDegree.DIPLOM;
    }
    return null;
}