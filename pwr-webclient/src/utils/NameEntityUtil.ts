import {NameEntity} from '../model/NameEntity';
import {isNull, isNullOrUndefined} from 'util';
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
            if(!isNullOrUndefined(name) && !isNullOrUndefined(name.name)) {
                res = name.name;
            }
        }
        return res;
    }
}