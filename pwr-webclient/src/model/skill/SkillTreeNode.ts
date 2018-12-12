import * as Immutable from 'immutable';
import {SkillCategory} from './SkillCategory';
import {Comparators} from '../../utils/Comparators';
import {SkillServiceSkill} from './SkillServiceSkill';


export class SkillNode {
    skillId: number;
    visible: boolean;

    constructor(skillId: number, visible: boolean) {
        this.skillId = skillId;
        this.visible = visible;
    }
}

export class SkillTreeNode {
    public skillCategoryId: number;

    public childNodes: Array<SkillTreeNode>;

    public skillNodes: Array<SkillNode>;

    public open: boolean;

    public visible: boolean;

    private constructor(skillCategoryId: number, childNodes: Array<SkillTreeNode>, skillNodes: Array<SkillNode>, open: boolean, visible: boolean) {
        this.skillCategoryId = skillCategoryId;
        this.childNodes = childNodes;
        this.skillNodes = skillNodes;
        this.open = open;
        this.visible = visible;
    }

    public static of(skillCategory: SkillCategory) {
        return new SkillTreeNode(skillCategory.id(), [], [], false, true);
    }

    public static root() {
        return new SkillTreeNode(-1, [], [], true, true);
    }

    public static shallowCopy(skillTreeNode: SkillTreeNode) {
        return new SkillTreeNode(skillTreeNode.skillCategoryId, skillTreeNode.childNodes,
            skillTreeNode.skillNodes, skillTreeNode.open, skillTreeNode.visible);
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
        if (this.skillCategoryId === parentId && this.getChildIndex(category.id()) === -1) {
            this.childNodes.push(SkillTreeNode.of(category));
            this.childNodes.sort(Comparators.getSkillTreeNodeComparator(categoriesById));
        } else {
            this.childNodes.forEach(childNode => childNode.addCategoryToTree(parentId, category, categoriesById));
        }
    }

    public addSkillIdToTree(categoryId: number, skillId: number) {
        if (categoryId === this.skillCategoryId && !this.hasSkill(skillId)) {
            this.skillNodes.push(new SkillNode(skillId, true));
        } else {
            this.childNodes.forEach(child => child.addSkillIdToTree(categoryId, skillId));
        }
    }

    public addSkillToTree(categoryId: number, skill: SkillServiceSkill) {
        this.addSkillIdToTree(categoryId, skill.id());
    }

    public removeCategoryFromTree(categoryId: number) {
        if (this.getChildIndex(categoryId) !== -1) {
            this.removeCategoryFromChildren(categoryId);
        } else {
            this.childNodes.forEach(childNode => childNode.removeCategoryFromTree(categoryId));
        }
    }

    public removeSkillFromTree(categoryId: number, skillId: number) {
        if (this.skillCategoryId === categoryId) {
            this.skillNodes = this.skillNodes.filter(skillNode => skillNode.skillId !== skillId);
        } else {
            this.childNodes.forEach(childNode => childNode.removeSkillFromTree(categoryId, skillId));
        }
    }

    public toggleOpen(skillCategoryId: number) {
        if (this.skillCategoryId === skillCategoryId) {
            this.open = !this.open;
        } else {
            this.childNodes.forEach(childNode => childNode.toggleOpen(skillCategoryId));
        }
    }

    public filter(onlyCustomSkills: boolean, searchTerm: string, skillsById: Immutable.Map<number, SkillServiceSkill>, skillCategoriesById: Immutable.Map<number, SkillCategory>) {
        let visible = false;
        this.childNodes.forEach(childNode => {
            // MUST onConfirm filter first.
            visible = childNode.filter(onlyCustomSkills, searchTerm, skillsById, skillCategoriesById) || visible;
        });
        this.skillNodes.forEach(skillNode => {
            skillNode.visible = this.nodeIsVisible(searchTerm, onlyCustomSkills, skillsById.get(skillNode.skillId));
            visible = visible || skillNode.visible;
        });
        this.visible = visible;
        this.open = visible;
        return visible;
    }

    public clearFilter() {
        this.visible = true;
        this.open = false;
        this.skillNodes.forEach(childNode => childNode.visible = true);
        this.childNodes.forEach(childNode => childNode.clearFilter());
    }

    public sort(categoriesById: Immutable.Map<number, SkillCategory>, skillsById: Immutable.Map<number, SkillServiceSkill>) {
        this.childNodes.sort(Comparators.getSkillTreeNodeComparator(categoriesById));
        this.skillNodes.sort(Comparators.getSkillTreeSkillNodeComparator(skillsById));
        this.childNodes.forEach(childNode => childNode.sort(categoriesById, skillsById));
    }

    protected nodeIsVisible(searchTerm: string, showOnlyCustom: boolean, skill: SkillServiceSkill) {
        if (showOnlyCustom) {
            if (!skill.isCustom()) {
                return false;
            }
            return skill.anyFuzzyMatch(searchTerm);
        } else {
            return skill.anyFuzzyMatch(searchTerm);
        }
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
        return this.skillNodes.some(skillNodes => skillNodes.skillId === skillIdToFind);
    }
}