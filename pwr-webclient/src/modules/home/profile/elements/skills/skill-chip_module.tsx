import * as React from 'react';
import {CSSProperties} from 'react';
import {Chip, Tooltip} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import UndoIcon from '@material-ui/icons/Undo';
import {StarRating} from '../../../../star-rating_module.';
import Avatar from '@material-ui/core/Avatar/Avatar';
import Popover from '@material-ui/core/Popover/Popover';
import {ProfileSkill} from '../../../../../reducers/profile-new/profile/model/ProfileSkill';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';

/**
 * Change of a skill against the saved state, shown while a project is being edited
 */
export enum SkillChange {
    ADDED = 'ADDED',
    REMOVED = 'REMOVED'
}

interface SkillChipLocalProps {
    skill: ProfileSkill;
    style?: CSSProperties;
    textColor?: string;
    className?: string;
    showRating?: boolean;
    canChangeRating?: boolean;
    disabled?: boolean;
    change?: SkillChange;

    onRatingChange?(newRating: number, skill: ProfileSkill): void;

    onDelete(skill: ProfileSkill): void;

    /**
     * Brings back a removed skill (change REMOVED)
     */
    onRestore?(skill: ProfileSkill): void;
}

interface SkillChipLocalState {
    anchorEl: any,
    popoverOpen: boolean,
}

export class SkillChip extends React.Component<SkillChipLocalProps, SkillChipLocalState> {

    constructor(props: SkillChipLocalProps) {
        super(props);
        this.state = {
            anchorEl: null,
            popoverOpen: false
        };
    };

    private skill = (): ProfileSkill => {
        return this.props.skill;
    };

    private handleRatingChange = (pos: number) => {
        this.showInfo(null);
        this.props.onRatingChange(pos, this.skill());
    };

    private handleDelete = () => {
        this.props.onDelete(this.skill());
    };

    private showInfo = (event: any) => {
        this.setState({
            anchorEl: (!this.state.anchorEl) ? event.currentTarget : null,
            popoverOpen: !this.state.popoverOpen,
        });
    };

    private Avatar = () => {
        if (this.props.showRating) {
            return <Avatar>{this.skill().rating}</Avatar>;
        }
        return <></>;
    };

    private makeDeleteHandler = () => {
        if (this.props.disabled) {
            return undefined;
        }
        if (this.props.change === SkillChange.REMOVED) {
            return () => this.props.onRestore(this.skill());
        }
        return () => this.handleDelete();
    };

    private tooltip(): string {
        switch (this.props.change) {
            case SkillChange.ADDED:
                return PowerLocalize.get('Profile.Project.Skill.Added');
            case SkillChange.REMOVED:
                return PowerLocalize.get('Profile.Project.Skill.Removed');
            default:
                return '';
        }
    }

    private RatingChanger = () => {
        if (this.props.canChangeRating) {
            return <Popover
                open={this.state.popoverOpen}
                onClose={this.showInfo}
                anchorEl={this.state.anchorEl}
                anchorOrigin={{horizontal: 'center', vertical: 'bottom'}}
                transformOrigin={{horizontal: 'center', vertical: 'top'}}
            >
                <StarRating rating={this.skill().rating} onRatingChange={this.handleRatingChange}/>
            </Popover>;
        } else {
            return <React.Fragment/>;
        }
    };


    render() {
        const change = this.props.change;
        const changeClass = change === SkillChange.ADDED ? ' pwr-skill-chip-added'
            : change === SkillChange.REMOVED ? ' pwr-skill-chip-removed' : '';
        return (
            <div>
                {/* Title only for a changed skill: an empty title shows no tooltip */}
                <Tooltip title={this.tooltip()}>
                    <Chip
                        clickable={!this.props.disabled}
                        color={change === SkillChange.ADDED ? 'secondary' : change === SkillChange.REMOVED ? 'default' : 'primary'}
                        variant={change === SkillChange.REMOVED ? 'outlined' : 'default'}
                        // An avatar, even an empty one, would hide the icon
                        avatar={this.props.showRating ? <this.Avatar/> : undefined}
                        icon={change === SkillChange.ADDED ? <AddIcon/> : undefined}
                        label={this.skill().name}
                        style={this.props.style}
                        className={(this.props.className || '') + changeClass}
                        onDelete={this.makeDeleteHandler()}
                        deleteIcon={change === SkillChange.REMOVED
                            ? <UndoIcon aria-label={PowerLocalize.get('Profile.Project.Skill.Restore')}/> : undefined}
                        onClick={this.showInfo}
                    />
                </Tooltip>
                <this.RatingChanger/>
            </div>
        );
    }
}
