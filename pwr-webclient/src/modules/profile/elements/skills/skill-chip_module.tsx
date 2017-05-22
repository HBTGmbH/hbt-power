import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {Skill} from '../../../../model/Skill';
import {Avatar, Chip, FontIcon, IconButton} from 'material-ui';
import {CSSProperties} from 'react';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';


/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link SkillChipProps} and will then be
 * managed by redux.
 */
interface SkillChipLocalProps {
    skill: Skill;
    style?: CSSProperties;
    onRatingChange(newRating: number, id: string): void;
    onDelete(id: string): void;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface SkillChipLocalState {

}

export class SkillChip extends React.Component<SkillChipLocalProps, SkillChipLocalState> {

    private styleYellow: CSSProperties = {
        color: "yellow"
    };

    private styleDefault: CSSProperties = {
        color: "initial"
    };




    private getStyle = (starPosition: number) => {
        if(starPosition <= this.props.skill.rating()) {
            return this.styleYellow;
        } else {
            return this.styleDefault;
        }
    };

    private handleStarPress = (pos: number) => {
        this.props.onRatingChange(pos, this.props.skill.id());
    };

    private handleDelete = () => {
        this.props.onDelete(this.props.skill.id())
    }

    render() {
        return (
            <Chip
                key={"Skill."+ this.props.skill.id()}
                style={this.props.style}
            >
                {this.props.skill.name()}
                    <IconButton
                        id={"Skill.Star1." + this.props.skill.id()}
                        onClick={() => this.handleStarPress(1)}
                        iconClassName="material-icons"
                        iconStyle={this.getStyle(1)}>star_rate</IconButton>
                    <IconButton  id={"Skill.Star2." + this.props.skill.id()} onClick={() => this.handleStarPress(2)} iconClassName="material-icons" iconStyle={this.getStyle(2)}>star_rate</IconButton>
                    <IconButton  id={"Skill.Star3." + this.props.skill.id()} onClick={() => this.handleStarPress(3)} iconClassName="material-icons" iconStyle={this.getStyle(3)}>star_rate</IconButton>
                    <IconButton  id={"Skill.Star4." + this.props.skill.id()} onClick={() => this.handleStarPress(4)} iconClassName="material-icons" iconStyle={this.getStyle(4)}>star_rate</IconButton>
                    <IconButton  id={"Skill.Star5." + this.props.skill.id()} onClick={() => this.handleStarPress(5)} iconClassName="material-icons" iconStyle={this.getStyle(5)}>star_rate</IconButton>
                    <IconButton  id={"Skill.Delete." + this.props.skill.id()} onClick={this.handleDelete} tooltip={PowerLocalize.get("Action.Delete")} iconClassName="material-icons">delete</IconButton>
            </Chip>);
    }
}
