import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AppBar, FlatButton, FontIcon, IconButton, IconMenu, MenuItem} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ProfileActionCreator} from '../../reducers/profile/ProfileActionCreator';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {isNullOrUndefined} from 'util';
import {LoginStatus} from '../../model/LoginStatus';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {StatisticsActionCreator} from '../../reducers/statistics/StatisticsActionCreator';
import {ProfileAsyncActionCreator} from '../../reducers/profile/ProfileAsyncActionCreator';
import {Paths} from '../../Paths';
import {NavigationActionCreator} from '../../reducers/navigation/NavigationActionCreator';
import {ApplicationState} from '../../reducers/reducerIndex';

interface ToolbarProps {
    loggedInUser: ConsultantInfo;
    loggedInAsAdmin: boolean;
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
    navigateTo(target: string): void;
    logOutUser(): void;
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
            statisticsAvailable: state.statisticsReducer.available(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>) : ToolbarDispatch {
        return {
            logOutUser: function() {
                dispatch(ProfileActionCreator.logOutUser());
                dispatch(AdminActionCreator.LogOutAdmin());
            },
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
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
        this.props.navigateTo(Paths.USER_REPORTS);
        // FIXME move this into the async action.
        this.props.loadExportDocuments(this.props.loggedInUser.initials());
    };

    private loadNetworkGraph = () => {
        // FIXME move this into the async action.
        this.props.loadNetworkGraph();
        this.props.navigateTo(Paths.USER_STATISTICS_NETWORK);
    };

    private loadConsultantClusterInfo = () => {
        // FIXME move this into the async action.
        this.props.loadConsultantClusterInfo(this.props.loggedInUser.initials());
        this.props.navigateTo(Paths.USER_STATISTICS_CLUSTERINFO);
    };

    private loadSkillStatistics = () => {
        // FIXME move this into the async action.
        this.props.loadSkillStatistics();
        this.props.navigateTo(Paths.USER_STATISTICS_SKILLS);
    };

    private logOutUser = () => {
        this.props.navigateTo(Paths.USER_SPECIAL_LOGOUT);
    };

    private renderMenu = () => {
        return (<IconMenu
            iconButtonElement={<IconButton iconClassName="material-icons">menu</IconButton>}
            anchorOrigin={{horizontal: 'left', vertical: 'top'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
        >
            <MenuItem
                primaryText={PowerLocalize.get('Menu.Home')}
                onClick={() => this.props.navigateTo(Paths.USER_HOME)}
            />
            <MenuItem
                onClick={() => this.props.navigateTo(Paths.USER_PROFILE)}
                primaryText={PowerLocalize.get('Menu.BaseData')}
            />
            <MenuItem
                primaryText={PowerLocalize.get('Menu.Reports')}
                onClick={this.loadExportDocuments}/>
            {
                this.props.statisticsAvailable ?
                    <MenuItem
                        primaryText={PowerLocalize.get('Menu.Statistics')}
                        rightIcon={<FontIcon className="material-icons">keyboard_arrow_right</FontIcon>}
                        menuItems={[
                            <MenuItem
                                key="Menu.Statistics.Network"
                                primaryText={PowerLocalize.get('Menu.Statistics.Network')}
                                onClick={this.loadNetworkGraph}
                            />,
                            <MenuItem
                                key="Menu.Statistics.Network"
                                primaryText={PowerLocalize.get('Menu.Statistics.Network.Clusterinfo')}
                                onClick={this.loadConsultantClusterInfo}
                            />,
                            <MenuItem
                                key="Menu.Statistics.Skills"
                                primaryText={PowerLocalize.get('Menu.Statistics.Skills')}
                                onClick={this.loadSkillStatistics}
                            />
                        ]}
                    />
                :
                null
            }
           <MenuItem
               primaryText={PowerLocalize.get('Menu.Search')}
               onClick={() => this.props.navigateTo(Paths.USER_SEARCH)}
           />
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
                            <FlatButton
                                label={PowerLocalize.get('Tooolbar.ToAdminOverview')}
                                onClick={() => this.props.navigateTo(Paths.ADMIN_CONSULTANTS)}
                            />
                            :
                            null
                    }
                    <FlatButton
                        onClick={this.logOutUser}
                        label={PowerLocalize.get('Tooolbar.LogOut')}
                    />
                </div>
            </AppBar>
        );
    }
}

export const PowerToolbar: React.ComponentClass<ToolbarLocalProps> = connect(PowerToolbarModule.mapStateToProps, PowerToolbarModule.mapDispatchToProps)(PowerToolbarModule);;