import {connect} from 'react-redux';
import * as React from 'react';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {ButtonBase, GridListTile, Icon, Menu, MenuItem, Tooltip} from '@material-ui/core';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ConsultantEditDialog} from './consultant-edit-dialog_module';
import {ApplicationState} from '../../../reducers/reducerIndex';
import Button from '@material-ui/core/Button/Button';
import GridListTileBar from '@material-ui/core/GridListTileBar/GridListTileBar';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';
import {ThunkDispatch} from 'redux-thunk';
import {PwrProfilePicture} from '../../general/pwr-profile-picture';
import {ProfileCheckSummary} from '../../../model/check/ProfileCheck';
import {formatToNumericDateTime, formatToRelativeTime} from '../../../utils/DateUtil';
import {selectConsultantName} from '../../../reducers/consultant-names/ConsultantNameActionCreator';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link ConsultantTile.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ConsultantTileProps {
    consultantInfo: ConsultantInfo;
    /** "Klaus" or "Kai B." (#216), the full name as long as the names are not loaded */
    shortName: string;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link ConsultantTileProps} and will then be
 * managed by redux.
 */
interface ConsultantTileLocalProps {
    initials: string;
    /** How up to date the profile is (#139); undefined while loading or for inactive consultants */
    profileCheck?: ProfileCheckSummary;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface ConsultantTileLocalState {
    dialogOpen: boolean;
    menuAnchorEl: any;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ConsultantTileDispatch {
    redirectToUser(initials: string): void;
}

function shortNameOf(state: ApplicationState, initials: string): string {
    const name = selectConsultantName(state, initials);
    const info = state.adminReducer.consultantsByInitials.get(initials);
    return name ? name.shortName : info ? info.firstName() + ' ' + info.lastName() : initials;
}

class ConsultantTileModule extends React.Component<ConsultantTileProps
    & ConsultantTileLocalProps
    & ConsultantTileDispatch, ConsultantTileLocalState> {

    constructor(props: ConsultantTileProps & ConsultantTileLocalProps & ConsultantTileDispatch) {
        super(props);
        this.state = {
            dialogOpen: false,
            menuAnchorEl: null,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ConsultantTileLocalProps): ConsultantTileProps {
        return {
            consultantInfo: state.adminReducer.consultantsByInitials.get(localProps.initials),
            shortName: shortNameOf(state, localProps.initials),
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ConsultantTileDispatch {
        return {
            redirectToUser: initials => dispatch(AdminActionCreator.AsyncRedirectToUser(initials))
        };
    }


    private showEditDialog = () => {
        // Close the menu, or it stays open behind the dialog
        this.setState({
            dialogOpen: true,
            menuAnchorEl: null
        });
    };

    private closeEditDialog = () => {
        this.setState({
            dialogOpen: false
        });
    };

    private handleMenuClick = (event: any) => {
        this.setState({
            menuAnchorEl: event.currentTarget
        });
    };


    private handleMenuClose = () => {
        this.setState({
            menuAnchorEl: null
        });
    };

    /**
     * Renders the menu for this tile
     * @returns JSX Element that represents the menu.
     */
    private renderMenu = () => {
        return (<Menu
            id="menu"
            anchorEl={this.state.menuAnchorEl}
            open={Boolean(this.state.menuAnchorEl)}
            onClose={this.handleMenuClose}
            /*anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            targetOrigin={{horizontal: 'right', vertical: 'top'}}*/
        >
            <MenuItem
                onClick={() => this.props.redirectToUser(this.props.initials)}
                disabled={!this.props.consultantInfo.active()}
            >
                <ListItemIcon>
                    <Icon className="material-icons">edit</Icon>
                </ListItemIcon>
                <ListItemText primary={PowerLocalize.get('ConsultantTile.EditProfile')}/>
            </MenuItem>


            <MenuItem
                onClick={this.showEditDialog}
            >
                <ListItemIcon>
                    <Icon className="material-icons">person</Icon>
                </ListItemIcon>
                <ListItemText primary={PowerLocalize.get('ConsultantTile.EditConsultant')}/>
            </MenuItem>
        </Menu>);
    };


    /**
     * Number of hints, last change and how often the profile was only confirmed since (fuzzy, exact in the tooltip)
     */
    private renderProfileCheck = () => {
        const check = this.props.profileCheck;
        if (!check) {
            return undefined;
        }
        const hints = check.hintCount === 0
            ? PowerLocalize.get('ConsultantTile.ProfileCheck.AllGood')
            : PowerLocalize.getFormatted('ConsultantTile.ProfileCheck.Hints', check.hintCount);
        const onlyConfirmed = check.confirmationsSinceLastChange > 0
            ? PowerLocalize.getFormatted('ConsultantTile.ProfileCheck.OnlyConfirmed', check.confirmationsSinceLastChange)
            : null;
        // Short on the tile, which cuts long lines; everything with the exact time in the tooltip
        const full = [hints,
            check.lastEdited ? PowerLocalize.getFormatted('ConsultantTile.ProfileCheck.Changed',
                formatToNumericDateTime(new Date(check.lastEdited))) : null,
            onlyConfirmed,
            check.lastConfirmed ? PowerLocalize.getFormatted('ConsultantTile.ProfileCheck.LastConfirmed',
                formatToRelativeTime(check.lastConfirmed)) : null].filter(part => !!part).join(' · ');
        return <Tooltip title={full}>
            <span>
                {onlyConfirmed ? onlyConfirmed + ' · ' : ''}{hints}
                {check.lastEdited && <> · {formatToRelativeTime(check.lastEdited)}</>}
            </span>
        </Tooltip>;
    };

    /**
     * The picture opens the profile like "Profil bearbeiten" in the menu (#193); not for inactive consultants, whose
     * menu entry is disabled as well
     */
    private renderPicture = () => {
        const info = this.props.consultantInfo;
        const picture = <PwrProfilePicture className={info.active() ? '' : 'disabled-consultant-img'}
                                           variant={'square'} style={{width: '100%', height: '100%'}}
                                           alt={info.getFullName()}
                                           pictureId={info.profilePictureId()}/>;
        if (!info.active()) {
            return picture;
        }
        const openProfile = PowerLocalize.getFormatted('ConsultantTile.OpenProfile', this.props.shortName);
        // Screen readers get the full name (#216)
        const openProfileLabel = PowerLocalize.getFormatted('ConsultantTile.OpenProfile', info.firstName() + ' ' + info.lastName());
        return <Tooltip title={openProfile}>
            <ButtonBase className="consultant-tile-picture" focusVisibleClassName="consultant-tile-picture-focus"
                        aria-label={openProfileLabel}
                        onClick={() => this.props.redirectToUser(this.props.initials)}>
                {picture}
            </ButtonBase>
        </Tooltip>;
    };

    render() {
        return (
            <div>
                {this.renderMenu()}
                <ConsultantEditDialog
                    initials={this.props.initials}
                    show={this.state.dialogOpen}
                    onClose={this.closeEditDialog}
                />
                <GridListTile
                    key={'ConsultantTile.' + this.props.initials}

                    /*actionPosition="right"
                    titlePosition="top"
                    titleBackground="linear-gradient(to bottom, rgba(70,230,230,0.7) 0%,rgba(70,230,230,0.3) 70%,rgba(70,230,230,0) 100%)"*/
                    cols={1}
                    rows={1}
                    style={{width: '300px', height: '300px', padding: 8}}
                >
                    {this.renderPicture()}
                    <GridListTileBar
                        // The short name (#216), the full name on hover; the picture has its own tooltip
                        title={<span title={this.props.consultantInfo.firstName() + ' ' + this.props.consultantInfo.lastName()}>
                            {this.props.shortName}
                        </span>}
                        subtitle={this.renderProfileCheck()}
                        //actionIcon={this.renderMenu()
                        actionIcon={
                            <Button onClick={this.handleMenuClick}>
                                <Icon className="material-icons" style={{color: 'white'}}>menu</Icon>
                            </Button>
                        }
                    />
                </GridListTile>
            </div>);
    }
}

export const ConsultantTile = connect(ConsultantTileModule.mapStateToProps, ConsultantTileModule.mapDispatchToProps)(ConsultantTileModule);
