import {ProfileSkill} from '../reducers/profile-new/profile/model/ProfileSkill';
import {NameEntity} from '../reducers/profile-new/profile/model/NameEntity';

export function areEqualByName(nameEntity1: NameEntity, nameEntity2: NameEntity) {
    if (!nameEntity1 && !nameEntity2) {
        return true;
    }
    if (!nameEntity1 && nameEntity2) {
        return false;
    }
    if (nameEntity1 && !nameEntity2) {
        return false;
    }
    return nameEntity1.name === nameEntity2.name;
}

export function areEqualSkillsByName(skill1: ProfileSkill, skill2: ProfileSkill) {
    return skill1.name === skill2.name;
}

export type EqualsFunction<T> = (a: T, b: T) => boolean;
export const DefaultEquals = (a: any, b: any) => {
    return a === b;
};

/**
 * Stolen from https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript/16436975#16436975
 */
export function areEqualArrays<T>(a1: Array<T>, a2: Array<T>, comparator: EqualsFunction<T> = DefaultEquals) {
    if (a1 === a2) return true;
    if (!a1 || !a2) return false;
    if (a1.length !== a2.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.
    for (var i = 0; i < a1.length; ++i) {
        if (!comparator(a1[i], a2[i])) {
            return false;
        }
    }
    return true;
}
