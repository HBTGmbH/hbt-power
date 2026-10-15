import {NameEntity} from '../reducers/profile-new/profile/model/NameEntity';

export function nameEntityName(nameEntity: NameEntity) {
    if (!nameEntity) {
        return '';
    }
    return nameEntity.name;
}

export function arrayDefault<T>(value: Array<T> | null | undefined): Array<T> {
    if (!value) {
        return [];
    }
    return value;
}
