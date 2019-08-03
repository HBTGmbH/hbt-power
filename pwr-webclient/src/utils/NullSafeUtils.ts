import {NameEntity} from '../reducers/profile-new/profile/model/NameEntity';

export function nameEntityName(nameEntity: NameEntity) {
    if (!nameEntity) {
        return '';
    }
    return nameEntity.name;
}
