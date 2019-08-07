import * as React from 'react';
import {CSSProperties} from 'react';
import {Chip} from '@material-ui/core';
import {StarRating} from '../../../../star-rating_module.';
import Avatar from '@material-ui/core/Avatar/Avatar';
import Popover from '@material-ui/core/Popover/Popover';
import {PwrDeleteConfirm} from '../../../../general/pwr-delete-confirm';
import {ProfileSkill} from '../../../../../reducers/profile-new/profile/model/ProfileSkill';


interface SkillChipLocalProps {
    skill: ProfileSkill;
    style?: CSSProperties;
    textColor?: string;
    className?: string;
    showRating?: boolean;
    canChangeRating?: boolean;
    disabled?: boolean;

    onRatingChange?(newRating: number, skill: ProfileSkill): void;

    onDelete(skill: ProfileSkill): void;
}

interface SkillChipLocalState {
    anchorEl: any,
    popoverOpen: boolean,
    openDelete: boolean,
}

export class SkillChip extends React.Component<SkillChipLocalProps, SkillChipLocalState> {

    constructor(props: SkillChipLocalProps) {
        super(props);
        this.state = {
            anchorEl: null,
            popoverOpen: false,
            openDelete: false,
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

    private openDeleteConfirm = () => {
        this.setState({
            openDelete: true,
        });
    };

    private closeConfirm = () => {
        this.setState({
            openDelete: false,
        });
    };

    private makeDeleteHandler = () => {
        if (this.props.disabled) {
            return undefined;
        }
        return () => this.openDeleteConfirm();
    };

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
        return (
            <div>
                <PwrDeleteConfirm
                    open={this.state.openDelete}
                    onClose={this.closeConfirm}
                    onConfirm={this.handleDelete}
                    header={'Skill ' + this.skill().name + ' löschen'}
                    infoText={'Willst du den Skill löschen?'}
                />
                <Chip
                    clickable={!this.props.disabled}
                    color={'primary'}
                    avatar={<this.Avatar/>}
                    label={this.skill().name}
                    style={this.props.style}
                    className={this.props.className}
                    onDelete={this.makeDeleteHandler()}
                    onClick={this.showInfo}
                />
                <this.RatingChanger/>
            </div>
        );
    }
}
