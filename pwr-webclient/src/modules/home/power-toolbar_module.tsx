import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState} from '../../Store';
import {AppBar, FlatButton, IconButton, IconMenu, ListItem} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ProfileActionCreator} from '../../reducers/profile/ProfileActionCreator';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {isNullOrUndefined} from 'util';
import {Link} from 'react-router';
import {LoginStatus} from '../../model/LoginStatus';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {Paths} from '../../index';

interface ToolbarProps {
    loggedInUser: ConsultantInfo;
    loggedInAsAdmin: boolean;
    viewSelected: boolean;
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
    backToAdmin(): void;
}

class PowerToolbarModule extends React.Component<ToolbarProps & ToolbarLocalProps & ToolbarDispatch, ToolbarLocalState> {

    constructor(props: ToolbarProps & ToolbarLocalProps & ToolbarDispatch) {
        super(props);
        this.state = {menuOpen: false};
    }

    static mapStateToProps(state: ApplicationState, localProps: ToolbarLocalProps) : ToolbarProps {
        return {
            loggedInUser: state.databaseReducer.loggedInUser(),
            loggedInAsAdmin: state.adminReducer.loginStatus() === LoginStatus.SUCCESS,
            viewSelected: !isNullOrUndefined(state.databaseReducer.activeViewProfileId())
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : ToolbarDispatch {
        return {
            logOutUser: function() {
                dispatch(ProfileActionCreator.logOutUser());
                dispatch(AdminActionCreator.LogOutAdmin());
            },
            backToAdmin: function() {
                dispatch(AdminActionCreator.NavigateTo(Paths.ADMIN_CONSULTANTS));
            }
        };
    }

    private handleMenuClick = () => {
        this.setState({menuOpen: true});
    };

    private getInitials = () => {
        return isNullOrUndefined(this.props.loggedInUser) ? '' : this.props.loggedInUser.initials();
    };


    private renderPower = () => {
        return (
        <div>
                <span>Poooower!   </span>
                <span>&nbsp;2.0</span>
        </div>);
    };

    private renderMenu = () => {
        return (<IconMenu
            iconButtonElement={<IconButton iconClassName="material-icons">menu</IconButton>}
            anchorOrigin={{horizontal: 'left', vertical: 'top'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
        >
            <Link to="/app/home"><ListItem primaryText={PowerLocalize.get('Menu.Home')} /></Link>
            <Link to="/app/profile"><ListItem primaryText={PowerLocalize.get('Menu.BaseData')} /></Link>
            {
                this.props.viewSelected ? <Link to="/app/view"><ListItem primaryText={PowerLocalize.get('Menu.View')} /></Link> : null
            }
            <Link to="/app/reports"><ListItem primaryText={PowerLocalize.get('Menu.Reports')} /></Link>
        </IconMenu>);
    };

    /**
     * @returns {any}
     */
    render() {
        return(
            <AppBar
                title={this.renderPower()}
                iconElementLeft={this.renderMenu()}
            >
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{marginRight: '20px'}}>
                    {PowerLocalize.get('Toolbar.LoggedInAs') + ': ' + this.getInitials()}
                    </span>
                    {
                        this.props.loggedInAsAdmin ?
                            <Link to={Paths.ADMIN_CONSULTANTS}>
                                <FlatButton
                                    label={PowerLocalize.get('Tooolbar.ToAdminOverview')}
                                />
                            </Link>
                            :
                            null
                    }
                    <FlatButton
                        onClick={this.props.logOutUser}
                        label={PowerLocalize.get('Tooolbar.LogOut')}
                    />
                </div>
            </AppBar>
        );
    }
}

export const PowerToolbar: React.ComponentClass<ToolbarLocalProps> = connect(PowerToolbarModule.mapStateToProps, PowerToolbarModule.mapDispatchToProps)(PowerToolbarModule);;