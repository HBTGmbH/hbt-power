import {NameEntity} from '../model/NameEntity';
import {SkillCategory} from '../model/skill/SkillCategory';
import {Skill} from '../model/Skill';
import * as Immutable from 'immutable';
import {AdminNotification} from '../model/admin/AdminNotification';
import {SkillNode, SkillTreeNode} from '../model/skill/SkillTreeNode';
import {BuildInfo} from '../model/metadata/BuildInfo';
import {SkillServiceSkill} from '../model/skill/SkillServiceSkill';
import {ComparatorBuilder, NullMode, nullSafe} from 'ts-comparator';
import {Project} from '../reducers/profile-new/profile/model/Project';

export const PROJECTS_BY_START_DATE = ComparatorBuilder
    .comparing<Project>(nullSafe(t => t.startDate.getDate()))
    .definingNullAs(NullMode.HIGHEST)
    .build();

export class Comparators {

    public static getNameEntityComparator(asc: boolean) {
        if (asc) {
            return (n1: NameEntity, n2: NameEntity) => Comparators.compareNameEntity(n2, n1);
        } else {
            return (n1: NameEntity, n2: NameEntity) => Comparators.compareNameEntity(n1, n2);
        }
    }

    public static getStringComparator(asc: boolean) {
        if (asc) {
            return (s1: string, s2: string) => Comparators.compareString(s2, s1);
        } else {
            return (s1: string, s2: string) => Comparators.compareString(s1, s2);
        }
    }

    public static getBuildInfoComparator(asc: boolean) {
        if (asc) {
            return (s1: BuildInfo, s2: BuildInfo) => Comparators.compareBuildInfo(s2, s1);
        } else {
            return (s1: BuildInfo, s2: BuildInfo) => Comparators.compareBuildInfo(s1, s2);
        }
    }

    public static compareNameEntity(n1: NameEntity, n2: NameEntity) {
        return Comparators.compareString(n1.name(), n2.name());
    }

    public static compareString(s1: string, s2: string) {
        if (s1 > s2) return -1;
        if (s1 == s2) return 0;
        return 1;
    }

    public static compareDate(d1: Date, d2: Date) {
        if (d1 > d2) return -1;
        if (d1 == d2) return 0;
        return 1;
    }

    public static compareCategories(s1: SkillCategory, s2: SkillCategory): number {
        return Comparators.compareString(s2.qualifier(), s1.qualifier());
    }

    public static getSkillTreeNodeComparator(categoriesById: Immutable.Map<number, SkillCategory>) {
        return function (s1: SkillTreeNode, s2: SkillTreeNode) {
            return Comparators.compareString(categoriesById.get(s2.skillCategoryId).qualifier(), categoriesById.get(s1.skillCategoryId).qualifier());
        };
    }

    public static getSkillTreeSkillNodeComparator(skillsById: Immutable.Map<number, SkillServiceSkill>) {
        return function (s1: SkillNode, s2: SkillNode) {
            return Comparators.compareString(skillsById.get(s2.skillId).qualifier(), skillsById.get(s1.skillId).qualifier());
        };
    }

    public static compareSkills(s1: Skill, s2: Skill): number {
        return Comparators.compareString(s2.name(), s1.name());
    }

    public static compareAdminNotification(a1: AdminNotification, a2: AdminNotification): number {
        return Comparators.compareDate(a1.occurrence(), a2.occurrence());
    }

    public static compareBuildInfo(b1: BuildInfo, b2: BuildInfo): number {
        return Comparators.compareString(b1.name(), b2.name());
    }


}
