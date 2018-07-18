import * as React from 'react';
import {CSSProperties} from 'react';
import {Skill} from '../../../../../model/Skill';
import {Chip, Icon, IconButton} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {StarRating} from '../../../../star-rating_module.';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';


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
    textColor?: string;
    className?: string;
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

    private handleRatingChange = (pos: number) => {
        this.props.onRatingChange(pos, this.props.skill.id());
    };

    private handleDelete = () => {
        this.props.onDelete(this.props.skill.id())
    };

    private showInfo = () => { };

    render() {
        return (
            <Chip
                style={this.props.style}
                className={this.props.className}
            >
                <div className="vertical-align" style={{maxWidth: "100%"}}>
                    <div><span style={{color: this.props.textColor}}>{this.props.skill.name()}</span></div>
                    <StarRating rating={this.props.skill.rating()} onRatingChange={this.handleRatingChange}/>
                    <Tooltip title={PowerLocalize.get("Action.Delete")} placement={"right-end"}>
                        <IconButton  id={"Skill.Delete." + this.props.skill.id()}
                                     onClick={this.handleDelete}
                                     className="material-icons"
                        >
                            delete
                        </IconButton>
                    </Tooltip>
                    {this.props.skill.isNew() ? <Icon className="material-icons">fiber_new</Icon>: false}
                </div>
            </Chip>);
    }
}
