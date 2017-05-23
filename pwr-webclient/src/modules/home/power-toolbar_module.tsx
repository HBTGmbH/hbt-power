import {ActionCreator, connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState} from '../../Store';
import {
    Avatar, Drawer, DropDownMenu, FlatButton, IconButton, IconMenu, MenuItem, Paper, Toolbar, ToolbarGroup,
    ToolbarTitle
} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ProfileActionCreator} from '../../reducers/singleProfile/ProfileActionCreator';

interface ToolbarProps {
    userInitials: string;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface ToolbarLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface ToolbarLocalState {
    menuOpen: boolean;
}

interface ToolbarDispatch {
    logOutUser(): void;
}

class PowerToolbarModule extends React.Component<ToolbarProps & ToolbarLocalProps & ToolbarDispatch, ToolbarLocalState> {

    constructor(props: ToolbarProps & ToolbarLocalProps & ToolbarDispatch) {
        super(props);
        this.state = {menuOpen: false};
    }

    static mapStateToProps(state: ApplicationState, localProps: ToolbarLocalProps) : ToolbarProps {
        return {
            userInitials: state.databaseReducer.loggedInUser()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : ToolbarDispatch {
        return {
            logOutUser: function() {
                dispatch(ProfileActionCreator.logOutUser());
            }
        };
    }

    private handleMenuClick = () => {
        this.setState({menuOpen: true});
    };

    /**
     *  <IconMenu
     iconButtonElement={<IconButton iconClassName="material-icons" onClick={this.handleMenuClick} tooltip={PowerLocalize.get('Menu.Singular')}>menu</IconButton>}
     >
     <MenuItem primaryText={PowerLocalize.get("Menu.Overview")} />
     <MenuItem primaryText={PowerLocalize.get("Menu.Profile")}/>
     <MenuItem primaryText={PowerLocalize.get("Menu.Views")} />
     <MenuItem primaryText={PowerLocalize.get("Menu.Logout")} />
     </IconMenu>
     * @returns {any}
     */
    render() {
        return(
            <Paper zDepth={3}>
                <Toolbar style={{height: "100px", backgroundColor:"SlateGray"}}>
                    <ToolbarGroup>
                        <div className="row">
                            <div className="col-md-3">
                                <img className="img-responsive" src="/img/HBTBlueWithText.png"/>
                            </div>
                            <div className="col-md-5" style={{paddingTop:"40px"}}>
                                <span style={{fontSize:"2.3em", fontStyle:"oblique", color: "white"}}>Poooower!   </span>
                                <span style={{fontSize:"2.3em", color: "white"}}>&nbsp;2.0</span>
                            </div>
                        </div>
                    </ToolbarGroup>
                    <ToolbarGroup lastChild={true}>
                        <div style={{marginRight: "30px", textAlign: "right", color:"white"}} >
                            <span style={{paddingRight:"15px"}}>{PowerLocalize.get('Toolbar.LoggedInAs') + ': ' + this.props.userInitials}</span>
                            <br/>
                            <FlatButton onClick={this.props.logOutUser} label={PowerLocalize.get("Tooolbar.LogOut")} />
                        </div>
                        <div style={{marginRight: "50px"}}>
                            <Avatar size={70} src="/img/crazy_lama.jpg" />
                        </div>
                    </ToolbarGroup>
                </Toolbar>


            </Paper>
        );
    }
}

export const PowerToolbar: React.ComponentClass<ToolbarLocalProps> = connect(PowerToolbarModule.mapStateToProps, PowerToolbarModule.mapDispatchToProps)(PowerToolbarModule);;