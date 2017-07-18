import * as React from 'react';
import {SkillCategory} from '../../../model/skill/SkillCategory';
import {FontIcon, List, ListItem, makeSelectable} from 'material-ui';
import {ReactUtils} from '../../../utils/ReactUtils';
import {SkillServiceSkill} from '../../../model/skill/SkillServiceSkill';
import wrapSelectableList = ReactUtils.wrapSelectableList;


let SelectableList = wrapSelectableList(makeSelectable(List));

interface SkillTreeProps {
    root: SkillCategory;
    selectedIndex: number | string;
    onIndexSelect(index: number | string): void;
    onLoadChildren(categoryId: number): void;
}

interface SkillTreeState {

}

export class SkillTree extends React.Component<SkillTreeProps, SkillTreeState> {

    constructor(props: SkillTreeProps) {
        super(props);
    }


    private mapTo = (skillCategory: SkillCategory): JSX.Element => {
        return <ListItem
            key={skillCategory.qualifier()}
            value={skillCategory.id()}
            nestedItems={this.renderNestedItems(skillCategory)}
            onNestedListToggle={(data) => this.props.onLoadChildren(data.props.value as any)}
            leftIcon={<FontIcon className="material-icons">label</FontIcon>}
        >
            {skillCategory.qualifier()}
        </ListItem>;
    };

    private mapSkill = (skill: SkillServiceSkill): JSX.Element => {
        return <ListItem
            key={skill.qualifier()}
            value={skill.qualifier()}
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

    render() {
        return (<SelectableList onSelect={this.props.onIndexSelect} selectedIndex={this.props.selectedIndex}>
            {this.renderNestedItems(this.props.root)}
        </SelectableList>);
    }
}
