import {NameEntity} from '../model/NameEntity';
import {PowerLocalize} from '../localization/PowerLocalizer';
import {ProfileElementType} from '../Store';

export class NameEntityUtil {


    public static typeToLocalizedType(nameEntity: NameEntity): string {
        return PowerLocalize.get('NameEntityType.' + nameEntity.type());
    }

    public static getProfileElementTypeValues() {
        let members = [];
        for (let i: number = 0; true; i++) {
            if (ProfileElementType[i] === undefined) break;
            members.push(ProfileElementType[i]);
        }
        return members;
    }

    public static getProfileElementTypes(): Array<ProfileElementType> {
        return Object.keys(ProfileElementType).map(key => ProfileElementType[key]);
    }
}
