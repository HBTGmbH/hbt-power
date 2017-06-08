import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {FontIcon, GridTile, IconButton, IconMenu, MenuItem} from 'material-ui';
import {getProfileImageLocation} from '../../../API_CONFIG';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ConsultantEditDialog} from './consultant-edit-dialog_module';

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
            dialogOpen: false
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


    /**
     * Renders the menu for this tile
     * @returns JSX Element that represents the menu.
     */
    private renderMenu = () => {
        return (<IconMenu
            iconButtonElement={<IconButton
                iconClassName="material-icons"
                iconStyle={{color: "white"}}
            >menu</IconButton>}
            anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
        >
            <MenuItem
                primaryText={PowerLocalize.get("ConsultantTile.EditProfile")}
                rightIcon={<FontIcon className="material-icons">edit</FontIcon>}
                onTouchTap={() => this.props.redirectToUser(this.props.initials)}
            />
            <MenuItem
                primaryText={PowerLocalize.get("ConsultantTile.EditConsultant")}
                rightIcon={<FontIcon className="material-icons">person</FontIcon>}
                onTouchTap={this.showEditDialog}
            />
        </IconMenu>)
    };



    render() {
        return (
            <div>
                <ConsultantEditDialog
                    initials={this.props.initials}
                    show={this.state.dialogOpen}
                    onRequestClose={this.closeEditDialog}
                />
                <GridTile
                    key={"ConsultantTile." + this.props.initials}
                    title={this.props.consultantInfo.getFullName()}
                    actionIcon={this.renderMenu()}
                    actionPosition="right"
                    titlePosition="top"
                    titleBackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
                    cols={1}
                    rows={1}
                    style={{width: "300px", height: "300px"}}

                >
                    <img src={getProfileImageLocation(this.props.consultantInfo.initials())}/>
                </GridTile>
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