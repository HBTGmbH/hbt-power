import {doop} from 'doop';
import * as Immutable from 'immutable';
import {SkillCategory} from './SkillCategory';
import {Comparators} from '../../utils/Comparators';
import {SkillServiceSkill} from './SkillServiceSkill';

@doop
export class SkillTreeNode {
    @doop public get skillCategoryId() {return doop<number, this>()};

    @doop public get childNodes() {return doop<Immutable.List<SkillTreeNode>, this>()};

    @doop public get skillIds() {return doop<Immutable.List<number>, this>()};

    private constructor(skillCategoryId: number, childNodes: Immutable.List<SkillTreeNode>, skillIds: Immutable.List<number>) {
        return this.skillCategoryId(skillCategoryId).childNodes(childNodes).skillIds(skillIds);
    }

    public static of(skillCategory: SkillCategory) {
        return new SkillTreeNode(skillCategory.id(), Immutable.List<SkillTreeNode>(), Immutable.List<number>());
    }

    public static root() {
        return new SkillTreeNode(-1 , Immutable.List<SkillTreeNode>(), Immutable.List<number>());
    }

    /**
     * Returns the index of the child category in the childNodes list.
     * @param childId
     * @returns {number|any} index or -1 when not found.
     */
    public getChildIndex(childId: number): number {
        return this.childNodes().findIndex(child => child.skillCategoryId() === childId);
    }

    /**
     * Recursively adds the given category to the tree, below the node with the given ID.
     * If the category is already in the tree, nothing happens.
     * @param parentId
     * @param category
     * @param categoriesById is necessary for sorting
     */
    public addCategoryToTree(parentId: number, category: SkillCategory, categoriesById: Immutable.Map<number, SkillCategory>): SkillTreeNode {
        let newNodes;
        if(this.skillCategoryId() === parentId) {
            let childIndex = this.getChildIndex(category.id());
            if(childIndex === -1) {
                newNodes = this.childNodes().push(SkillTreeNode.of(category));
            } else {
                newNodes = this.childNodes();
            }
        } else {
            newNodes = this.childNodes().map(child => child.addCategoryToTree(parentId, category, categoriesById));
        }
        return this.childNodes(Immutable.List<SkillTreeNode>(newNodes.sort(Comparators.getSkillTreeNodeComparator(categoriesById))));
    }

    public removeCategoryFromChildren(categoryId: number): SkillTreeNode {
        let children = Immutable.List<SkillTreeNode>(this.childNodes().filter(childNode => childNode.skillCategoryId() !== categoryId));
        if(children.size !== this.childNodes().size) {
            return this.childNodes(children);
        }
        let newCategories = this.childNodes().map(child => child.removeCategoryFromChildren(categoryId));
        return this.childNodes(Immutable.List<SkillTreeNode>(newCategories));
    }


    public hasSkill(skill: SkillServiceSkill): boolean {
        return this.skillIds().some(skillId => skillId === skill.id());
    }

    public addSkillToTree(categoryId: number, skill: SkillServiceSkill): SkillTreeNode {
        if(categoryId === this.skillCategoryId() && !this.hasSkill(skill)) {
            return this.skillIds(this.skillIds().push(skill.id()));
        } else {
            let childNodes = this.childNodes().map(child => child.addSkillToTree(categoryId, skill));
            return this.childNodes(Immutable.List<SkillTreeNode>(childNodes));
        }
    }
}