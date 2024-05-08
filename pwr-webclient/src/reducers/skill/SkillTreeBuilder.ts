import {SkillNode, SkillTreeNode} from '../../model/skill/SkillTreeNode';
import {SkillServiceSkill} from '../../model/skill/SkillServiceSkill';
import {SkillCategory} from '../../model/skill/SkillCategory';
import {TCategoryNode} from '../../model/skill/tree/TCategoryNode';
import {TSkillNode} from '../../model/skill/tree/TSkillNode';
import * as Immutable from 'immutable';

export interface SkillTreeBuilderResult {
    tree: SkillTreeNode; // The root node;
    skillsById: Immutable.Map<number, SkillServiceSkill>;
    categoriesById: Immutable.Map<number, SkillCategory>;
}

export class SkillTreeBuilder {

    private originalRoot: TCategoryNode;
    private skills: Map<number, SkillServiceSkill>;
    private categories: Map<number, SkillCategory>;

    private treeRoot: SkillTreeNode;

    private constructor(root: TCategoryNode) {
        this.originalRoot = root;
        this.skills = new Map();
        this.categories = new Map();
    }

    public static for(root: TCategoryNode): SkillTreeBuilder {
        return new SkillTreeBuilder(root);
    }

    public build = (): SkillTreeBuilderResult => {
        this.addCategoryToTree(this.originalRoot);
        console.debug('Tree Done', this.treeRoot);
        const categoriesById = Immutable.Map<number, SkillCategory>(this.categories.entries());
        const skillsById = Immutable.Map<number, SkillServiceSkill>(this.skills.entries());
        this.treeRoot.clearFilter();
        this.treeRoot.sort(categoriesById, skillsById);
        return {
            tree: this.treeRoot,
            categoriesById: categoriesById,
            skillsById: skillsById
        };
    };

    private addCategoryToTree = (category: TCategoryNode): SkillTreeNode => {
        // First, store this category
        // Secondly, store all skills
        // The iterate over children, do the same.
        let skillServiceCategory = SkillCategory.fromTCategoryNode(category);
        let skillTreeNode = SkillTreeNode.of(skillServiceCategory);
        this.categories.set(skillServiceCategory.id, skillServiceCategory);
        if (!this.treeRoot) {
            this.treeRoot = skillTreeNode;
        }
        skillTreeNode.skillNodes = category.childSkills.map((childSkill) => this.addSkillToTree(childSkill, skillTreeNode));
        skillTreeNode.childNodes = category.childCategories.map((childCategory) => this.addCategoryToTree(childCategory));
        return skillTreeNode;
    };

    private addSkillToTree = (skill: TSkillNode, currentNode: SkillTreeNode): SkillNode => {
        // We have to create two objects here. The first one is the skill that is saved for the store, the second
        // one the node that is placed into the tree that references this skill object
        let skillServiceSkill = SkillServiceSkill.fromTSkillNode(skill, currentNode.skillCategoryId);
        let skillTreeNode = new SkillNode(skill.id, false);
        this.skills.set(skillServiceSkill.id(), skillServiceSkill);
        return skillTreeNode;
    };

}
