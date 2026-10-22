import * as React from 'react';
import * as Immutable from 'immutable';
import {SkillCategory} from '../../../model/skill/SkillCategory';
import {Icon, ListItemText} from '@material-ui/core';
import {SkillServiceSkill} from '../../../model/skill/SkillServiceSkill';
import {SkillNode, SkillTreeNode} from '../../../model/skill/SkillTreeNode';
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';
import {PwrTree, PwrTreeNode} from '../tree/pwr-tree';
import Label from '@material-ui/icons/Label';
import {compareNames} from '../../../utils/Comparators';
import {PwrIconButton} from '../pwr-icon-button';
import {PowerLocalize} from '../../../localization/PowerLocalizer';

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
     * Without it no trash icon: deleting an own skill from the tree (#180), the caller asks first
     */
    onSkillDelete?(skillId: number): void;

    /**
     * See onSkillDelete, for own categories
     */
    onCategoryDelete?(categoryId: number): void;

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
        onNestedListToggle: () => {
        },
        onCategorySelect: () => {
        },
        onSkillSelect: () => {
        }
    };

    private static CustomIcon = () => <Icon className="material-icons" fontSize="small">extension</Icon>;

    private static DisplayIcon = () => <Icon className="material-icons" fontSize="small">airplay</Icon>;

    /**
     * Trash icon of an entry, as in the other lists of the app (#180); the click must not select the entry
     */
    private static DeleteIcon = (props: { onDelete(): void }) =>
        <span className="pwr-skill-tree-delete" onClick={event => event.stopPropagation()}>
            <PwrIconButton iconName="delete" tooltip={PowerLocalize.get('Action.Delete')} onClick={props.onDelete}/>
        </span>;

    private getSkill = (skillId: number): SkillServiceSkill => {
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
            this.props.onCategorySelect(node.payload.categoryId);
        } else {
            throw RangeError('Node ' + JSON.stringify(node) + ' has neither skill nor category ID set!');
        }
    };

    private mapChildNodes = (skillTreeNode: SkillTreeNode) => {
        return [
            ...skillTreeNode.childNodes.filter(value => value.visible).map(this.mapNode),
            ...skillTreeNode.skillNodes.filter(value => value.visible).map(this.mapLeaf)
        ];
    };

    private mapLeaf = (skillNode: SkillNode): PwrTreeNode<TreePayload> => {
        return {
            expanded: false,
            id: `s_${skillNode.skillId}`,
            payload: {skillId: skillNode.skillId},
            children: [],
            selected: skillNode.skillId === this.props.selectedSkillId
        };
    };

    private mapNode = (skillTreeNode: SkillTreeNode): PwrTreeNode<TreePayload> => {
        return {
            expanded: skillTreeNode.open,
            id: `s_${skillTreeNode.skillCategoryId}`,
            children: this.mapChildNodes(skillTreeNode),
            payload: {categoryId: skillTreeNode.skillCategoryId},
            selected: skillTreeNode.skillCategoryId === this.props.selectedCategoryId,
        };
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
            <ListItemText secondary={skill.aliases().isEmpty() ? undefined : skill.aliases().sort(compareNames).join(', ')}>
                <span className="pwr-skill-tree-label">
                    {skill.qualifier()}
                    {skill.isCustom() && <SkillTree.CustomIcon/>}
                </span>
            </ListItemText>
            {skill.isCustom() && this.props.onSkillDelete &&
            <SkillTree.DeleteIcon onDelete={() => this.props.onSkillDelete(skillId)}/>}
        </React.Fragment>;
    };

    private renderCategoryElement = (categoryId: number): JSX.Element => {
        let skillCategory = this.props.categoriesById.get(categoryId);
        return <React.Fragment>
            <ListItemIcon>
                <Label/>
            </ListItemIcon>
            <ListItemText>
                <span className="pwr-skill-tree-label">
                    {skillCategory.qualifier}
                    {skillCategory.isCustom && <SkillTree.CustomIcon/>}
                    {skillCategory.isDisplay && <SkillTree.DisplayIcon/>}
                </span>
            </ListItemText>
            {skillCategory.isCustom && this.props.onCategoryDelete &&
            <SkillTree.DeleteIcon onDelete={() => this.props.onCategoryDelete(categoryId)}/>}
        </React.Fragment>;
    };

    render() {
        //console.debug("Invoking re-render of tree", this.props.root);
        return <PwrTree
            contentRenderFunction={(payload: TreePayload) => this.renderElement(payload)}
            nodes={this.mapNodes()}
            toggleNode={(node) => this.handleNodeToggle(node)}
            onSelect={this.handleSelection}
        />;
    }
}
