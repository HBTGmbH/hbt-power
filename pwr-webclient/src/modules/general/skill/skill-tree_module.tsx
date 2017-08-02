import * as React from 'react';
import {SkillCategory} from '../../../model/skill/SkillCategory';
import {FontIcon, List, ListItem, makeSelectable} from 'material-ui';
import {ReactUtils} from '../../../utils/ReactUtils';
import {SkillServiceSkill} from '../../../model/skill/SkillServiceSkill';
import wrapSelectableList = ReactUtils.wrapSelectableList;


let SelectableList = wrapSelectableList(makeSelectable(List));

interface SkillTreeProps {
    root: SkillCategory;
    /**
     * Invoked when a category is expanded and needs its children loaded
     * @param categoryId of the category that has been expanded
     */
    onLoadChildren(categoryId: number): void;

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
        onCategorySelect: () => {},
        onSkillSelect: () => {}
    };


    private mapTo = (skillCategory: SkillCategory): JSX.Element => {
        return <ListItem
            key={skillCategory.qualifier()}
            value={SkillTree.CATEGORY_PREFIX + skillCategory.id().toString()}
            nestedItems={this.renderNestedItems(skillCategory)}
            onNestedListToggle={() => this.props.onLoadChildren(skillCategory.id())}
            leftIcon={<FontIcon className="material-icons">label</FontIcon>}
            primaryTogglesNestedList={this.props.expandOnClick}
        >
            {skillCategory.qualifier()}
            {skillCategory.blacklisted() ?
                <FontIcon
                    className="material-icons blacklisted-icon"
                    style={{marginLeft: "24px", position: "absolute", top: "12px"}}
                >warning</FontIcon>
                : false}
        </ListItem>;
    };

    private mapSkill = (skill: SkillServiceSkill): JSX.Element => {
        return <ListItem
            key={skill.qualifier()}
            value={SkillTree.SKILL_PREFIX + skill.id().toString()}
            leftIcon={<FontIcon className="material-icons">label_outline</FontIcon>}
        >
            {skill.qualifier()}
        </ListItem>;
    };

    private renderNestedItems = (skillCategory: SkillCategory): Array<JSX.Element> => {
        let res: Array<JSX.Element> = skillCategory.categories().map(this.mapTo).toArray();
        skillCategory.skills().forEach((value, key, iter) => res.push(this.mapSkill(value)));
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
