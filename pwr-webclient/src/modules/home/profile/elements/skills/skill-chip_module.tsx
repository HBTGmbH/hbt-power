import * as React from 'react';
import {CSSProperties} from 'react';
import {Skill} from '../../../../../model/Skill';
import {Chip} from '@material-ui/core';
import {StarRating} from '../../../../star-rating_module.';
import Avatar from '@material-ui/core/Avatar/Avatar';
import Popover from '@material-ui/core/Popover/Popover';
import {PwrDeleteConfirm} from '../../../../general/pwr-delete-confirm';


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
    anchorEl: any,
    popoverOpen: boolean,
    openDelete:boolean,
}

export class SkillChip extends React.Component<SkillChipLocalProps, SkillChipLocalState> {

    private handleRatingChange = (pos: number) => {
        this.showInfo(null);
        this.props.onRatingChange(pos, this.props.skill.id());
    };

    private handleDelete = () => {
        this.props.onDelete(this.props.skill.id());
    };

    private showInfo = (event: any) => {
        this.setState({
            anchorEl: (!this.state.anchorEl) ? event.currentTarget : null,
            popoverOpen: !this.state.popoverOpen,
        });
    };

    private openDeleteConfirm = () => {
        this.setState({
            openDelete:true,
        })
    };

    private closeConfirm = () => {
        this.setState({
            openDelete:false,
        })
    };

    constructor(props: SkillChipLocalProps) {
        super(props);
        this.state = {
            anchorEl: null,
            popoverOpen: false,
            openDelete:false,
        };
    };


    render() {
        return (
            <div>
                <PwrDeleteConfirm
                    open={this.state.openDelete}
                    onClose={this.closeConfirm}
                    onConfirm={this.handleDelete}
                    header={"Skill "+this.props.skill.name()+" löschen"}
                    infoText={"Willst du den Skill löschen?"}
                />
                <Chip
                    avatar={<Avatar>{this.props.skill.rating()}</Avatar>}
                    label={this.props.skill.name()}
                    style={this.props.style}
                    className={this.props.className}
                    onDelete={this.openDeleteConfirm}
                    onClick={this.showInfo}
                />
                <Popover
                    open={this.state.popoverOpen}
                    onClose={this.showInfo}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{horizontal: 'center', vertical: 'bottom'}}
                    transformOrigin={{horizontal: 'center', vertical: 'top'}}
                >
                    <StarRating rating={this.props.skill.rating()} onRatingChange={this.handleRatingChange}/>
                </Popover>
            </div>
        );
    }
}
