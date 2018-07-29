import * as React from 'react';
import {SkillCategory} from '../../../model/skill/SkillCategory';
import {Icon, ListItemText} from '@material-ui/core';
import {SkillServiceSkill} from '../../../model/skill/SkillServiceSkill';
import {SkillNode, SkillTreeNode} from '../../../model/skill/SkillTreeNode';
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';
import {PwrTree, PwrTreeNode} from '../tree/pwr-tree';
import {Label} from '@material-ui/icons';

interface SkillTreeProps {
    root: SkillTreeNode;

    /**
     * Invoked when a category is expanded and needs its children loaded
     * @param categoryId of the category that has been expanded
     */
    onNestedListToggle?(categoryId: number): void;

    /**
     * Invokes when a category has been clicked
     * @param categoryId of the clicked category
     */
    onCategorySelect?(categoryId: number): void;
    /**
     * Invokes when a skill has been clicked
     * @param skillId of the clicked skill
     */
    onSkillSelect?(skillId: number): void;

    /**
     * Lookup for categories; Always has to be in sync with the skill tree; All Ids in the skill tree
     * must be in this map, too.
     */
    categoriesById: Immutable.Map<number, SkillCategory>;

    /**
     * See categoriesbyId, but for skills
     */
    skillsById: Immutable.Map<number, SkillServiceSkill>;

    selectedSkillId: number;
    selectedCategoryId: number;

}

interface SkillTreeState {
}

interface TreePayload {
    skillId?: number;
    categoryId?: number;
}

export class SkillTree extends React.Component<SkillTreeProps, SkillTreeState> {

    constructor(props: SkillTreeProps) {
        super(props);
    }

    public static defaultProps: Partial<SkillTreeProps> = {
        onNestedListToggle: () => {},
        onCategorySelect: () => {},
        onSkillSelect: () => {}
    };

    private static CustomIcon = (props: {margin: string}) => <Icon
            className="material-icons"
            style={{marginLeft: props.margin, position: "absolute", top: "12px"}}
        >
            extension
        </Icon>;

    private static DisplayIcon = (props: {margin: string}) => <Icon
        className="material-icons"
        style={{marginLeft: props.margin, position: "absolute", top: "12px"}}
    >
        airplay
    </Icon>;

    private static BlacklistedIcon = (props: {margin: string}) => <Icon
        className="material-icons blacklisted-icon"
        style={{marginLeft: props.margin, position: "absolute", top: "12px"}}
    >
        warning
    </Icon>;

    private getSkill = (skillId: number):SkillServiceSkill => {
        return this.props.skillsById.get(skillId);
    };

    private getCategory = (id: number): SkillCategory => {
        return this.props.categoriesById.get(id);
    };

    private renderElement = (payload: TreePayload) => {
        if (payload.categoryId) {
            return this.renderCategoryElement(payload.categoryId);
        } else if (payload.skillId) {
            return this.renderSkillElement(payload.skillId);
        } else {
            return <></>;
        }
    };

    private handleSelection = (node: PwrTreeNode<TreePayload>) => {
        if (node.payload.skillId) {
            this.props.onSkillSelect(node.payload.skillId);
        } else if (node.payload.categoryId) {
            this.props.onCategorySelect(node.payload.categoryId)
        } else {
            throw RangeError("Node " + JSON.stringify(node) + " has neither skill nor category ID set!");
        }
    };

    private mapChildNodes = (skillTreeNode: SkillTreeNode) => {
        return [
            ...skillTreeNode.childNodes.filter(value => value.visible).map(this.mapNode),
            ...skillTreeNode.skillNodes.filter(value => value.visible).map(this.mapLeaf)
        ]
    };

    private mapLeaf = (skillNode: SkillNode): PwrTreeNode<TreePayload> => {
        return {
            expanded: false,
            id: `s_${skillNode.skillId}`,
            payload: {skillId: skillNode.skillId},
            children: [],
            selected: skillNode.skillId === this.props.selectedSkillId
        }
    };

    private mapNode = (skillTreeNode: SkillTreeNode): PwrTreeNode<TreePayload> => {
        return {
            expanded: skillTreeNode.open,
            id: `s_${skillTreeNode.skillCategoryId}`,
            children: this.mapChildNodes(skillTreeNode),
            payload: { categoryId: skillTreeNode.skillCategoryId},
            selected: skillTreeNode.skillCategoryId === this.props.selectedCategoryId,
        }
    };


    private mapNodes = (): Array<PwrTreeNode<TreePayload>> => {
        return this.props.root.childNodes.filter(node => node.visible).map(this.mapNode);
    };

    private handleNodeToggle = (node: PwrTreeNode<TreePayload>) => {
        if (node.payload.categoryId) {
            this.props.onNestedListToggle(node.payload.categoryId);
        }
    };

    private renderSkillElement = (skillId: number) => {
        let skill = this.props.skillsById.get(skillId);
        return <React.Fragment key={skill.qualifier()}>
            <ListItemIcon>
                <Icon className="material-icons">label_outline</Icon>
            </ListItemIcon>
            <ListItemText>
            {skill.qualifier()}
            {skill.isCustom() ? <SkillTree.CustomIcon margin={"24px"}/> : false}
            </ListItemText>
        </React.Fragment>
    };

    private renderCategoryElement = (categoryId: number): JSX.Element => {
        let skillCategory = this.props.categoriesById.get(categoryId);

        let currentMargin = 24;
        let blacklistIcon = null;
        let customIcon = null;
        let displayIcon = null;

        if(skillCategory.blacklisted()) {
            blacklistIcon = <SkillTree.BlacklistedIcon margin={currentMargin + "px"}/>;
            currentMargin += 24
        }
        if(skillCategory.isCustom()) {
            customIcon = <SkillTree.CustomIcon margin={currentMargin + "px"}/>;
            currentMargin += 24
        }
        if(skillCategory.isDisplay()) {
            displayIcon =  <SkillTree.DisplayIcon margin={currentMargin + "px"}/>;
            currentMargin += 24
        }

        return <React.Fragment>
            <ListItemIcon>
                <Label/>
            </ListItemIcon>
            <ListItemText>
                {skillCategory.qualifier()}
                {blacklistIcon}
                {customIcon}
                {displayIcon}
            </ListItemText>
        </React.Fragment>;
    };

    render() {
        console.debug("Invoking re-render of tree", this.props.root);
        return <PwrTree
            contentRenderFunction={(payload: TreePayload) => this.renderElement(payload)}
            nodes={this.mapNodes()}
            toggleNode={(node) => this.handleNodeToggle(node)}
            onSelect={this.handleSelection}
        />
    }
}
