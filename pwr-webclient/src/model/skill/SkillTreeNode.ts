import * as Immutable from 'immutable';
import {SkillCategory} from './SkillCategory';
import {Comparators} from '../../utils/Comparators';
import {SkillServiceSkill} from './SkillServiceSkill';

export class SkillTreeNode {
    public skillCategoryId: number;

    public childNodes: Array<SkillTreeNode>;

    public skillIds: Array<number>;

    private constructor(skillCategoryId: number, childNodes: Array<SkillTreeNode>, skillIds: Array<number>) {
        this.skillCategoryId = skillCategoryId;
        this.childNodes = childNodes;
        this.skillIds = skillIds;
    }

    public static of(skillCategory: SkillCategory) {
        return new SkillTreeNode(skillCategory.id(), [], []);
    }

    public static root() {
        return new SkillTreeNode(-1 , [], []);
    }

    /**
     * Returns the index of the child category in the childNodes list.
     * @param childId
     * @returns {number|any} index or -1 when not found.
     */
    private getChildIndex(childId: number): number {
        return this.childNodes.findIndex(child => child.skillCategoryId == childId);
    }

    private removeCategoryFromChildren(categoryId: number) {
        this.childNodes = this.childNodes.filter(childNode => childNode.skillCategoryId !== categoryId);
    }


    private hasSkill(skillIdToFind: number): boolean {
        return this.skillIds.some(skillId => skillId === skillIdToFind);
    }

    /**
     * Recursively adds the given category to the tree, below the node with the given ID.
     * If the category is already in the tree, nothing happens.
     * @param parentId
     * @param category
     * @param categoriesById is necessary for sorting
     */
    public addCategoryToTree(parentId: number, category: SkillCategory, categoriesById: Immutable.Map<number, SkillCategory>) {
        let newNodes;
        if(this.skillCategoryId === parentId && this.getChildIndex(category.id()) === -1 ) {
            this.childNodes.push(SkillTreeNode.of(category));
            this.childNodes.sort(Comparators.getSkillTreeNodeComparator(categoriesById));
        } else {
            this.childNodes.forEach(childNode => childNode.addCategoryToTree(parentId, category, categoriesById));
        }
    }




    public addSkillIdToTree(categoryId: number, skillId: number) {
        if(categoryId === this.skillCategoryId && !this.hasSkill(skillId)) {
            this.skillIds.push(skillId);
        } else {
            this.childNodes.forEach(child => child.addSkillIdToTree(categoryId, skillId));
        }
    }

    public addSkillToTree(categoryId: number, skill: SkillServiceSkill) {
        this.addSkillIdToTree(categoryId, skill.id());
    }

    public removeCategoryFromTree(categoryId: number) {
        if(this.getChildIndex(categoryId) !== -1) {
            this.removeCategoryFromChildren(categoryId);
        } else {
            this.childNodes.forEach(childNode => childNode.removeCategoryFromTree(categoryId));
        }
    }

    public removeSkillFromTree(categoryId: number, skillId: number) {
        if(this.skillCategoryId === categoryId) {
            this.skillIds = this.skillIds.filter(sId => sId !== skillId);
        } else {
            this.childNodes.forEach(childNode => childNode.removeSkillFromTree(categoryId, skillId));
        }
    }
}