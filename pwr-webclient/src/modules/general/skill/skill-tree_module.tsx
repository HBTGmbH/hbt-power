import * as React from 'react';
import {SkillCategory} from '../../../model/skill/SkillCategory';
import {Icon, List, ListItem} from '@material-ui/core';
import {ReactUtils} from '../../../utils/ReactUtils';
import {SkillServiceSkill} from '../../../model/skill/SkillServiceSkill';
import {SkillTreeNode} from '../../../model/skill/SkillTreeNode';
import wrapSelectableList = ReactUtils.wrapSelectableList;
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';

// TODO make Selectable


//let SelectableList = wrapSelectableList(makeSelectable(List));

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
     * List elements with nested elements expand on a click or tap. Defaults to true.
     */
    expandOnClick?: boolean;

    /**
     * Lookup for categories; Always has to be in sync with the skill tree; All Ids in the skill tree
     * must be in this map, too.
     */
    categoriesById: Immutable.Map<number, SkillCategory>;

    /**
     * See categoriesbyId, but for skills
     */
    skillsById: Immutable.Map<number, SkillServiceSkill>;

}

interface SkillTreeState {
    selectedIndex: any;
}

export class SkillTree extends React.Component<SkillTreeProps, SkillTreeState> {

    private static readonly SKILL_PREFIX = "SK_";
    private static readonly CATEGORY_PREFIX = "CA_";

    constructor(props: SkillTreeProps) {
        super(props);
        this.state = {
            selectedIndex: null
        }
    }

    public static defaultProps: Partial<SkillTreeProps> = {
        expandOnClick: true,
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


    private mapTo = (skillTreeNode: SkillTreeNode): JSX.Element => {
        let skillCategory = this.props.categoriesById.get(skillTreeNode.skillCategoryId);

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

    // Todo nesting
        return <ListItem
            key={skillCategory.qualifier()}
            value={SkillTree.CATEGORY_PREFIX + skillCategory.id().toString()}
            //children={this.renderNestedItems(skillTreeNode)}
           //onNestedListToggle={() => this.props.onNestedListToggle(skillCategory.id())}
            //leftIcon={<Icon className="material-icons">label</Icon>}
            //primaryTogglesNestedList={this.props.expandOnClick}
            //open={skillTreeNode.open}
        >
            {skillCategory.qualifier()}
            {blacklistIcon}
            {customIcon}
            {displayIcon}
        </ListItem>;
    };

    private mapSkill = (skillId: number): JSX.Element => {
        let skill = this.props.skillsById.get(skillId);
        return <ListItem
            key={skill.qualifier()}
            value={SkillTree.SKILL_PREFIX + skill.id().toString()}
        >
            <ListItemIcon>
                <Icon className="material-icons">label_outline</Icon>
            </ListItemIcon>
            {skill.qualifier()}
            {skill.isCustom() ? <SkillTree.CustomIcon margin={"24px"}/> : false}
        </ListItem>;
    };

    private renderNestedItems = (skillTreeNode: SkillTreeNode): Array<JSX.Element> => {
        let res: Array<JSX.Element> = skillTreeNode.childNodes.filter(childNode => childNode.visible).map(this.mapTo);
        skillTreeNode.skillNodes.filter(skillNode => skillNode.visible).forEach(skillNode => res.push(this.mapSkill(skillNode.skillId)));
        return res;
    };

    private handleOnSelect = (e: any, v: string) => {
        // Get the prefix
        let prefix = v.slice(0, 3);
        let id = Number.parseInt(v.slice(3, v.length));
        if(isNaN(id)) throw TypeError(v.slice(3, v.length)+ " is not a valid number.");
        if(prefix === SkillTree.SKILL_PREFIX) {
            this.props.onSkillSelect(id);
        } else if(prefix === SkillTree.CATEGORY_PREFIX) {
            this.props.onCategorySelect(id);
        } else {
            throw RangeError(prefix + " is not a valid prefix. Must be " + JSON.stringify([SkillTree.SKILL_PREFIX, SkillTree.CATEGORY_PREFIX]));
        }
        this.setState({selectedIndex: v});
    };

    render() {
        console.debug("Invoking re-render of tree", this.props.root);
        return (
            <List //selectedIndex={this.state.selectedIndex} //onSelect={this.handleOnSelect}
                >
            {this.renderNestedItems(this.props.root)}
        </List>);
    }
}
