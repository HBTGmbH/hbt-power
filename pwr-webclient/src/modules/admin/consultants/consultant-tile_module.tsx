import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {Icon, GridListTile, IconButton, Menu, MenuItem} from '@material-ui/core';
import {getProfileImageLocation} from '../../../API_CONFIG';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ConsultantEditDialog} from './consultant-edit-dialog_module';
import {ApplicationState} from '../../../reducers/reducerIndex';
import Button from '@material-ui/core/Button/Button';
import GridListTileBar from '@material-ui/core/GridListTileBar/GridListTileBar';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link ConsultantTile.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ConsultantTileProps {
    consultantInfo: ConsultantInfo;
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
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface ConsultantTileLocalState {
    dialogOpen: boolean;
    menuAnchorEl : any;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ConsultantTileDispatch {
    redirectToUser(initials: string): void;
}

class ConsultantTileModule extends React.Component<
    ConsultantTileProps
    & ConsultantTileLocalProps
    & ConsultantTileDispatch, ConsultantTileLocalState> {

    constructor(props: ConsultantTileProps & ConsultantTileLocalProps & ConsultantTileDispatch) {
        super(props);
        this.state = {
            dialogOpen: false,
            menuAnchorEl: null,
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: ConsultantTileLocalProps): ConsultantTileProps {
        return {
            consultantInfo: state.adminReducer.consultantsByInitials().get(localProps.initials),
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ConsultantTileDispatch {
        return {
            redirectToUser: initials => dispatch(AdminActionCreator.AsyncRedirectToUser(initials))
        }
    }


    private showEditDialog = () => {
        this.setState({
            dialogOpen: true
        });
    };

    private closeEditDialog = () => {
        this.setState({
            dialogOpen: false
        });
    };

    private handleMenuClick = (event:any) => {
    this.setState({
        menuAnchorEl: event.currentTarget
    })
    };


    private handleMenuClose = (event:any) => {
        this.setState({
            menuAnchorEl: null
        })
    };

    /**
     * Renders the menu for this tile
     * @returns JSX Element that represents the menu.
     */
    // TODO check Menu (IconButton) struktur
    private renderMenu = () => {
        return (<Menu
            id="menu"
            anchorEl={this.state.menuAnchorEl}
            open = {Boolean(this.state.menuAnchorEl)}
            onClose = {this.handleMenuClose}
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
                <ListItemText primary={PowerLocalize.get("ConsultantTile.EditProfile")}/>
            </MenuItem>



            <MenuItem
                onClick={this.showEditDialog}
            >
                <ListItemIcon>
                    <Icon className="material-icons">person</Icon>
                </ListItemIcon>
                <ListItemText primary={PowerLocalize.get("ConsultantTile.EditConsultant")}/>
            </MenuItem>
        </Menu>)
    };



    render() {
        return (
            <div>
                <ConsultantEditDialog
                    initials={this.props.initials}
                    show={this.state.dialogOpen}
                    onClose={this.closeEditDialog}
                />
                <GridListTile
                    key={"ConsultantTile." + this.props.initials}
                    title={this.props.consultantInfo.getFullName()}

                    /*actionPosition="right"
                    titlePosition="top"
                    titleBackground="linear-gradient(to bottom, rgba(70,230,230,0.7) 0%,rgba(70,230,230,0.3) 70%,rgba(70,230,230,0) 100%)"*/
                    cols={1}
                    rows={1}
                    style={{width: "300px", height: "300px"}}
                >

                    <img className={this.props.consultantInfo.active() ? "" : "disabled-consultant-img"} src={getProfileImageLocation(this.props.consultantInfo.initials())}/>
                    <GridListTileBar
                        title={this.props.consultantInfo.getFullName()}
                        //actionIcon={this.renderMenu()
                        actionIcon={
                            <Button onClick={this.handleMenuClick}>
                                <Icon className="material-icons" style={{color:"white"}}>menu</Icon>
                            </Button>
                        }
                    />
                </GridListTile>
            </div>);
    }
}

/**
 * Renders a single {@link GridTile} with all necessary information to represent a consultant for a brief overview.
 * The grid tile contains name, profile pictures and provides ways to edit the consultant details and to quickly
 * switch to their respective profile.
 * @see ConsultantTileModule
 * @author nt
 * @since 07.06.2017
 */
export const ConsultantTile: React.ComponentClass<ConsultantTileLocalProps> = connect(ConsultantTileModule.mapStateToProps, ConsultantTileModule.mapDispatchToProps)(ConsultantTileModule);