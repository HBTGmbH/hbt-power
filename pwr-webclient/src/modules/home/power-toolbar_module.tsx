import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState} from '../../Store';
import {AppBar, FlatButton, FontIcon, IconButton, IconMenu, ListItem, MenuItem} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ProfileActionCreator} from '../../reducers/profile/ProfileActionCreator';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {isNullOrUndefined} from 'util';
import {Link} from 'react-router';
import {LoginStatus} from '../../model/LoginStatus';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {Paths} from '../../index';
import {StatisticsActionCreator} from '../../reducers/statistics/StatisticsActionCreator';
import {ProfileAsyncActionCreator} from '../../reducers/profile/ProfileAsyncActionCreator';

interface ToolbarProps {
    loggedInUser: ConsultantInfo;
    loggedInAsAdmin: boolean;
    viewSelected: boolean;
    statisticsAvailable: boolean;
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
    loadNetworkGraph(): void;
    loadConsultantClusterInfo(initials: string): void;
    loadExportDocuments(initials: string): void;
    loadSkillStatistics(): void;
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
            viewSelected: !isNullOrUndefined(state.databaseReducer.activeViewProfileId()),
            statisticsAvailable: state.statisticsReducer.available(),
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
            },
            loadNetworkGraph: () => dispatch(StatisticsActionCreator.AsyncRequestNetwork()),
            loadConsultantClusterInfo: initials => dispatch(StatisticsActionCreator.AsyncRequestConsultantClusterInfo(initials)),
            loadExportDocuments: (initials) => dispatch(ProfileAsyncActionCreator.getAllExportDocuments(initials)),
            loadSkillStatistics: () => dispatch(StatisticsActionCreator.AsyncRequestSkillUsages())
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

    private loadExportDocuments = () => {
        this.props.loadExportDocuments(this.props.loggedInUser.initials());
    };

    private renderMenu = () => {
        return (<IconMenu
            iconButtonElement={<IconButton iconClassName="material-icons">menu</IconButton>}
            anchorOrigin={{horizontal: 'left', vertical: 'top'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
        >
            <Link to={Paths.USER_HOME}><MenuItem  primaryText={PowerLocalize.get('Menu.Home')} /></Link>
            <Link to={Paths.USER_PROFILE}><MenuItem  primaryText={PowerLocalize.get('Menu.BaseData')} /></Link>
            {
                this.props.viewSelected ? <Link to="/app/view"><MenuItem  primaryText={PowerLocalize.get('Menu.View')} /></Link> : null
            }
            <Link to={Paths.USER_REPORTS}><MenuItem  primaryText={PowerLocalize.get('Menu.Reports')} onClick={this.loadExportDocuments}/></Link>
            {
                this.props.statisticsAvailable ?
                    <MenuItem
                        primaryText={PowerLocalize.get('Menu.Statistics')}
                        rightIcon={<FontIcon className="material-icons">keyboard_arrow_right</FontIcon>}
                        menuItems={[
                            <Link to={Paths.USER_STATISTICS_NETWORK}>
                                <MenuItem
                                    key="Menu.Statistics.Network"
                                    primaryText={PowerLocalize.get('Menu.Statistics.Network')}
                                    onClick={this.props.loadNetworkGraph}
                                />
                            </Link>,
                            <Link to={Paths.USER_STATISTICS_CLUSTERINFO}>
                                <MenuItem
                                    key="Menu.Statistics.Network"
                                    primaryText={PowerLocalize.get('Menu.Statistics.Network.Clusterinfo')}
                                    onClick={() => this.props.loadConsultantClusterInfo(this.props.loggedInUser.initials())}
                                />
                            </Link>,
                            <Link to={Paths.USER_STATISTICS_SKILLS}>
                                <MenuItem
                                    key="Menu.Statistics.Skills"
                                    primaryText={PowerLocalize.get('Menu.Statistics.Skills')}
                                    onClick={() => this.props.loadSkillStatistics()}
                                />
                            </Link>

                        ]}
                    />
                :
                null
            }
            <Link to={Paths.USER_SEARCH}><MenuItem  primaryText={PowerLocalize.get('Menu.Search')}/></Link>
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