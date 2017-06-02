import {NameEntity} from '../model/NameEntity';
import {isNull, isNullOrUndefined} from 'util';
import {PowerLocalize} from '../localization/PowerLocalizer';
import {ProfileElementType} from '../Store';
export class NameEntityUtil {

    /**
     * Null tolerant accessor to a {@link NameEntity#name}
     * @param id
     * @param lookup
     * @returns {string}
     */
    public static getNullTolerantName(id: string, lookup: Immutable.Map<string, NameEntity>) {
        let res: string = "";
        if(!isNullOrUndefined(id)) {
            let name: NameEntity = lookup.get(id);
            if(!isNullOrUndefined(name) && !isNullOrUndefined(name.name())) {
                res = name.name();
            }
        }
        return res;
    }

    /**
     * Mapping function that maps a {@link NameEntity} to the string represeting
     * {@link NameEntity#name}
     * @param nameEntity
     * @returns {string}
     */
    public static mapToName(nameEntity: NameEntity) {
        return nameEntity.name();
    }

    public static typeToLocalizedType(nameEntity: NameEntity) {
        return PowerLocalize.get("NameEntityType." + nameEntity.type());
    }

    public static typeToViewAPIString(profileElementType: ProfileElementType) {
        switch(profileElementType) {
            case ProfileElementType.LanguageEntry:
                return "LANGUAGE";
            case ProfileElementType.TrainingEntry:
                return "TRAINING";
            case ProfileElementType.QualificationEntry:
                return "QUALIFICATION";
            case ProfileElementType.SectorEntry:
                return "SECTOR";
            case ProfileElementType.EducationEntry:
                return "EDUCATION";
        }
    }
}