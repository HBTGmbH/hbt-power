import * as React from 'react';
import {isNullOrUndefined} from 'util';
import {FontIcon} from 'material-ui';

export interface APISkillCategory {
    id: number;
    qualifier: string;
    category: APISkillCategory;
}

export interface APISkillServiceSkill {
    id: number;
    category: APISkillCategory;
    qualifier: string;
}

const TYPE_CATEGORY = "CATEGORY";
const TYPE_SKILL = "SKILL";

export class SkillCategoryNode {
    id: number;
    categoryId: number;
    title: string | JSX.Element;
    children: Array<SkillCategoryNode>;
    expanded: boolean;
    qualifier: string;
    type: "CATEGORY" | "SKILL";


    private constructor(id: number, categoryId: number, title:  string | JSX.Element, children: Array<SkillCategoryNode>, expanded: boolean,
            type: "CATEGORY" | "SKILL", qualifier: string) {
        this.categoryId = categoryId;
        this.title = title;
        this.children = children;
        this.expanded = expanded;
        this.id = id;
        this.type = type;
        this.title = title;
        this.qualifier = qualifier;
    }

    public static root() {
        return new SkillCategoryNode(-1, -1,  "root", [], true, TYPE_CATEGORY, "root");
    }

    private hasChild(id: number, type: "CATEGORY" | "SKILL") {
        return this.children.some(value => value.id == id && value.type == type)
    }

    public static isSkillLeaf(node: SkillCategoryNode) {
        return node.type == TYPE_SKILL;
    }


    public static isCategory(node: SkillCategoryNode) {
        return node.type == TYPE_CATEGORY;
    }

    /**
     * Adds a node as child and returns a copy
     * @param apiSkillCategory
     * @returns {SkillCategoryNode}
     */
    public addNodeAsChild(apiSkillCategory: APISkillCategory): SkillCategoryNode {
        if(isNullOrUndefined(apiSkillCategory.category) && this.categoryId == -1) {
            // Found another category without parent.
            // This category is root(defined by -1) -> Add under root.
            if(!this.children.some(value => value.id == apiSkillCategory.id && value.type == TYPE_CATEGORY)) {
                let child = new SkillCategoryNode(apiSkillCategory.id, -1, apiSkillCategory.qualifier, [], false, TYPE_CATEGORY, apiSkillCategory.qualifier);
                return new SkillCategoryNode(this.id, this.categoryId, this.title,  [... this.children, child], this.expanded, this.type, this.qualifier);
            } else {
                return this;
            }
        } else if(apiSkillCategory.category.id == this.id) {
            // This category is parent
            // Add under the condition that the children do not contain one with the same name already.
            if(!this.children.some(value => value.id == apiSkillCategory.id && value.type == TYPE_CATEGORY)) {
                // Children do not contain this child already
                let child = new SkillCategoryNode(apiSkillCategory.id, apiSkillCategory.category.id,
                    apiSkillCategory.qualifier, [], false, TYPE_CATEGORY, apiSkillCategory.qualifier);
                return new SkillCategoryNode(this.id, this.categoryId, this.title,  [... this.children, child], this.expanded, this.type, this.qualifier);
            } else {
                // Children contain the child already
                return this;
            }
        } else {
            // One of the children might be parent
            let newChildren = this.children.map(child => child.addNodeAsChild(apiSkillCategory));
            return new SkillCategoryNode(this.id, this.categoryId, this.title, newChildren, this.expanded, this.type, this.qualifier);
        }
    }

    public addNodeAsLeaf(apiSkill: APISkillServiceSkill): SkillCategoryNode {
        if(isNullOrUndefined(apiSkill.category)) {
            return this;
        } else if(this.type == TYPE_CATEGORY && apiSkill.category.id == this.id) {
            // This node is a the parent of the skill.
            // Add it to the nodes children, but only if the skill isn't already preset as child
            if(!this.hasChild(apiSkill.id, TYPE_SKILL)) {
                let child = new SkillCategoryNode(apiSkill.id,
                    apiSkill.category.id,
                    (<div><FontIcon className="material-icons">keyboard</FontIcon>{apiSkill.qualifier}</div>),
                    [],
                    false,
                    TYPE_SKILL,
                    apiSkill.qualifier
                );
                return new SkillCategoryNode(this.id, this.categoryId, this.title,  [... this.children, child], this.expanded, this.type, this.qualifier);
            } else {
                return this;
            }
        } else {
            // One of the children might be parent
            let newChildren = this.children.map(child => child.addNodeAsLeaf(apiSkill));
            return new SkillCategoryNode(this.id, this.categoryId, this.title, newChildren, this.expanded, this.type, this.qualifier);
        }
    }


    public static of(skillCategoryNode: SkillCategoryNode): SkillCategoryNode {
        let children = skillCategoryNode.children.map((value, index, array) => SkillCategoryNode.of(value));
        return new SkillCategoryNode(skillCategoryNode.id, skillCategoryNode.categoryId, skillCategoryNode.title,
            children, skillCategoryNode.expanded, skillCategoryNode.type, skillCategoryNode.qualifier);
    }

}
