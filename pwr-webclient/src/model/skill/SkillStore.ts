import {SkillCategory} from './SkillCategory';
import * as Immutable from 'immutable';
import {AddSkillStep} from './AddSkillStep';
import {UnCategorizedSkillChoice} from './UncategorizedSkillChoice';
import {SkillServiceSkill} from './SkillServiceSkill';
import {SkillTreeNode} from './SkillTreeNode';

export interface SkillStore {
    skillTreeRoot: SkillTreeNode;
    categorieHierarchiesBySkillName: Immutable.Map<string, string>;
    skillsById: Immutable.Map<number, SkillServiceSkill>;
    currentAddSkillStep: AddSkillStep;
    currentSkillRating: number;
    currentSkillName: string;
    currentChoice: UnCategorizedSkillChoice;
    skillComment: string;
    addSkillError: string;
    noCategoryReason: string;
    categoriesById: Immutable.Map<number, SkillCategory>;
    skillsByQualifier: Immutable.Map<string, SkillServiceSkill>;
    profileOnlySkillQualifiers: Immutable.Set<string>;
    doneState: string, addToProjectId: string;
    parentCategoryIdById: Map<number, number>;
    filterNonCustomSkills: boolean;
    filterTerm: string;
}

export function emptySkillStore(): SkillStore {
    return {
        skillTreeRoot: SkillTreeNode.root(),
        categorieHierarchiesBySkillName: Immutable.Map<string, string>(),
        skillsById: Immutable.Map<number, SkillServiceSkill>(),
        currentAddSkillStep: AddSkillStep.NONE,
        currentSkillRating: 1,
        currentSkillName: 'string',
        currentChoice: UnCategorizedSkillChoice.PROCEED_WITH_COMMENT,
        skillComment: '',
        addSkillError: null,
        noCategoryReason: '',
        categoriesById: Immutable.Map<number, SkillCategory>(),
        skillsByQualifier: Immutable.Map<string, SkillServiceSkill>(),
        profileOnlySkillQualifiers: Immutable.Set<string>(),
        doneState: '',
        addToProjectId: '',
        parentCategoryIdById: new Map<number, number>(),
        filterNonCustomSkills: false,
        filterTerm: ''
    }
}

export function getInverseCategoryHierarchy(categoryId: number, skillStore: SkillStore) {
    let resString = '';
    let delimiter = '';
    let currentCategory = skillStore.categoriesById.get(categoryId);
    while (!!currentCategory) {
        resString += delimiter;
        resString += currentCategory.qualifier();
        let parentId = skillStore.parentCategoryIdById.get(currentCategory.id());
        currentCategory = skillStore.categoriesById.get(parentId);
        delimiter = ' <= ';
    }
    return resString;
}

export function skillWithQualifierExists(qualifier: string, skillStore: SkillStore) {
    return skillStore.skillsByQualifier.has(qualifier);
}
