import * as React from 'react';
import {SkillCategory} from '../../../model/skill/SkillCategory';
import {FontIcon, List, ListItem, makeSelectable} from 'material-ui';
import {ReactUtils} from '../../../utils/ReactUtils';
import {SkillServiceSkill} from '../../../model/skill/SkillServiceSkill';
import {SkillTreeNode} from '../../../model/skill/SkillTreeNode';
import wrapSelectableList = ReactUtils.wrapSelectableList;


let SelectableList = wrapSelectableList(makeSelectable(List));

interface SkillTreeProps {
    root: SkillTreeNode;
    /**
     * Invoked when a category is expanded and needs its children loaded
     * @param categoryId of the category that has been expanded
     */
    onLoadChildren?(categoryId: number): void;

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
        onLoadChildren: () => {},
        onCategorySelect: () => {},
        onSkillSelect: () => {}
    };

    private static CustomIcon = (props: {secondIconMargin: string}) => <FontIcon
            className="material-icons"
            style={{marginLeft: props.secondIconMargin, position: "absolute", top: "12px"}}
        >
            extension
        </FontIcon>;


    private mapTo = (skillTreeNode: SkillTreeNode): JSX.Element => {
        let skillCategory = this.props.categoriesById.get(skillTreeNode.skillCategoryId);
        let secondIconMargin = (skillCategory.blacklisted() && skillCategory.isCustom()) ? "48px": "24px";
        return <ListItem
            key={skillCategory.qualifier()}
            value={SkillTree.CATEGORY_PREFIX + skillCategory.id().toString()}
            nestedItems={this.renderNestedItems(skillTreeNode)}
            onNestedListToggle={() => this.props.onLoadChildren(skillCategory.id())}
            leftIcon={<FontIcon className="material-icons">label</FontIcon>}
            primaryTogglesNestedList={this.props.expandOnClick}
        >
            {skillCategory.qualifier()}
            {skillCategory.blacklisted() ?
                <FontIcon
                    className="material-icons blacklisted-icon"
                    style={{marginLeft: "24px", position: "absolute", top: "12px"}}
                >
                    warning
                </FontIcon>
                : false}
            {skillCategory.isCustom() ? <SkillTree.CustomIcon secondIconMargin={secondIconMargin}/> : false}
        </ListItem>;
    };

    private mapSkill = (skillId: number): JSX.Element => {
        let skill = this.props.skillsById.get(skillId);
        return <ListItem
            key={skill.qualifier()}
            value={SkillTree.SKILL_PREFIX + skill.id().toString()}
            leftIcon={<FontIcon className="material-icons">label_outline</FontIcon>}
        >
            {skill.qualifier()}
            {skill.isCustom() ? <SkillTree.CustomIcon secondIconMargin={"24px"}/> : false}
        </ListItem>;
    };

    private renderNestedItems = (skillTreeNode: SkillTreeNode): Array<JSX.Element> => {
        let res: Array<JSX.Element> = skillTreeNode.childNodes.map(this.mapTo);
        skillTreeNode.skillIds.forEach(skillId => res.push(this.mapSkill(skillId)));
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
        return (<SelectableList selectedIndex={this.state.selectedIndex} onSelect={this.handleOnSelect}>
            {this.renderNestedItems(this.props.root)}
        </SelectableList>);
    }
}
