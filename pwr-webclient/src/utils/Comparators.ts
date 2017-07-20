import {NameEntity} from '../model/NameEntity';
import {SkillCategory} from '../model/skill/SkillCategory';
import {Skill} from '../model/Skill';
export class Comparators {

    public static getNameEntityComparator(asc: boolean) {
        if(asc) {
            return (n1: NameEntity, n2: NameEntity) => Comparators.compareNameEntity(n2, n1)
        } else {
            return (n1: NameEntity, n2: NameEntity) => Comparators.compareNameEntity(n1, n2)
        }
    }

    public static getStringComparator(asc: boolean) {
        if(asc) {
            return (s1: string, s2: string) => Comparators.compareString(s2, s1)
        } else {
            return (s1: string, s2: string) => Comparators.compareString(s1, s2)
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

    public static compareCategories(s1: SkillCategory, s2: SkillCategory): number {
        return Comparators.compareString(s2.qualifier(), s1.qualifier());
    }

    public static compareSkills(s1: Skill, s2: Skill): number {
        return Comparators.compareString(s2.name(), s1.name());
    }


}