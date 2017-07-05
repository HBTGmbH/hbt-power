import {EducationEntry} from '../model/EducationEntry';
import {ViewElement} from '../model/viewprofile/ViewElement';
import {NameEntity} from '../model/NameEntity';
export class Comparators {

    public static getNameEntityComparator(asc: boolean) {
        if(asc) {
            return (n1: NameEntity, n2: NameEntity) => Comparators.compareNameEntity(n2, n1)
        } else {
            return (n1: NameEntity, n2: NameEntity) => Comparators.compareNameEntity(n1, n2)
        }

    }

    public static compareNameEntity(n1: NameEntity, n2: NameEntity) {
        return Comparators.compareString(n1.name(), n2.name());
    }

    public static compareString(s1: string, s2:string) {
        if(s1 > s2) return -1;
        if(s1 == s2) return 0;
        return 1;
    }


}