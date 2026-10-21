import {SkillCategory} from '../model/skill/SkillCategory';
import {Skill} from '../model/Skill';
import * as Immutable from 'immutable';
import {AdminNotification} from '../model/admin/AdminNotification';
import {SkillNode, SkillTreeNode} from '../model/skill/SkillTreeNode';
import {SkillServiceSkill} from '../model/skill/SkillServiceSkill';
import {ComparatorBuilder, NullMode, nullSafe} from 'ts-comparator';
import {Project} from '../reducers/profile-new/profile/model/Project';
import {ProfileSkill} from '../reducers/profile-new/profile/model/ProfileSkill';
import {NameEntity} from '../reducers/profile-new/profile/model/NameEntity';
import {Language} from '../reducers/profile-new/profile/model/Language';
import {Education} from '../reducers/profile-new/profile/model/Education';
import {Career} from '../reducers/profile-new/profile/model/Career';
import {Qualification} from '../reducers/profile-new/profile/model/Qualification';
import {FurtherTraining} from '../reducers/profile-new/profile/model/FurtherTraining';
import {ProfileEntry} from '../reducers/profile-new/profile/model/ProfileEntry';
import {toIdx} from '../reducers/profile-new/profile/model/LanguageLevel';
import {LocalDate} from './DateUtil';

/**
 * Order of names in lists: without regard to case, umlauts with their base letter, numbers by value (Java 8 before
 * Java 11)
 */
const NAME_COLLATOR = new Intl.Collator('de', {sensitivity: 'accent', numeric: true});

export const compareNames = (name1: string, name2: string): number => NAME_COLLATOR.compare(name1 || '', name2 || '');

export const PROJECTS_BY_START_DATE = ComparatorBuilder
    .comparing<Project>(nullSafe(t => t.startDate))
    .definingNullAs(NullMode.HIGHEST)
    .build();

export const PROFILE_SKILLS_BY_NAME = (skill1: ProfileSkill, skill2: ProfileSkill): number =>
    compareNames(skill1.name, skill2.name);

export const NAME_ENTITY_BY_NAME = ComparatorBuilder
    .comparing<NameEntity>(n => n.name)
    .build();

export class Comparators {

    public static getStringComparator(asc: boolean) {
        if (asc) {
            return (s1: string, s2: string) => Comparators.compareString(s2, s1);
        } else {
            return (s1: string, s2: string) => Comparators.compareString(s1, s2);
        }
    }

    /**
     * Descending by {@link compareNames}: callers pass (s2, s1) for ascending order
     */
    public static compareString(s1: string, s2: string) {
        return compareNames(s2, s1);
    }

    public static compareDate(d1: Date | LocalDate, d2: Date | LocalDate) {
        if (d1 > d2) return -1;
        if (d1 == d2) return 0;
        return 1;
    }

    public static compareCategories(s1: SkillCategory, s2: SkillCategory): number {
        return Comparators.compareString(s2.qualifier, s1.qualifier);
    }

    public static getSkillTreeNodeComparator(categoriesById: Immutable.Map<number, SkillCategory>) {
        return function (s1: SkillTreeNode, s2: SkillTreeNode) {
            return Comparators.compareString(categoriesById.get(s2.skillCategoryId).qualifier, categoriesById.get(s1.skillCategoryId).qualifier);
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

    public static compareEducationByEndDate(edu1: Education, edu2: Education): number {
        return Comparators.compareDate(edu1.endDate, edu2.endDate);
    }

    public static compareCareerByEndDate(career1: Career, career2: Career): number {
        return Comparators.compareDate(career1.endDate, career2.endDate);
    }

    public static compareQualificationByDate(qualification1: Qualification, qualification2: Qualification): number {
        return Comparators.compareDate(qualification1.date, qualification2.date);
    }

    public static compareFurtherTrainingByEndDate(training1: FurtherTraining, training2: FurtherTraining): number {
        return Comparators.compareDate(training1.endDate, training2.endDate);
    }

    public static compareLanguageByLevel(lang1: Language, lang2: Language): number {
        return toIdx(lang2.level) - toIdx(lang1.level);
    }

    private static compareProfileEntryByName(entry1: ProfileEntry, entry2: ProfileEntry) {
        return this.compareString(entry2.nameEntity.name, entry1.nameEntity.name);
    }

    public static compareProfileEntries = (type: string, entry1: ProfileEntry, entry2: ProfileEntry) => {
        switch (type) {
            case 'LANGUAGE':
                return Comparators.compareLanguageByLevel(entry1 as Language, entry2 as Language);
            case 'SECTOR':
                return Comparators.compareProfileEntryByName(entry1, entry2);
            case 'SPECIAL_FIELD':
                return Comparators.compareProfileEntryByName(entry1, entry2);
            case 'TRAINING':
                return Comparators.compareFurtherTrainingByEndDate(entry1 as FurtherTraining, entry2 as FurtherTraining);
            case 'CAREER':
                return Comparators.compareCareerByEndDate(entry1 as Career, entry2 as Career);
            case 'QUALIFICATION':
                return Comparators.compareQualificationByDate(entry1 as Qualification, entry2 as Qualification);
            case 'EDUCATION':
                return Comparators.compareEducationByEndDate(entry1 as Education, entry2 as Education);
        }
        return 0;
    }
}
