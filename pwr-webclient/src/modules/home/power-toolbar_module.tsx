import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AppBar, Icon, IconButton, Menu, MenuItem} from '@material-ui/core';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {LoginStatus} from '../../model/LoginStatus';
import {StatisticsActionCreator} from '../../reducers/statistics/StatisticsActionCreator';
import {Paths} from '../../Paths';
import {NavigationActionCreator} from '../../reducers/navigation/NavigationActionCreator';
import {ApplicationState} from '../../reducers/reducerIndex';
import {ViewProfile} from '../../model/view/ViewProfile';
import {getImagePath} from '../../API_CONFIG';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import Collapse from '@material-ui/core/Collapse/Collapse';
import Paper from '@material-ui/core/Paper/Paper';
import Avatar from '@material-ui/core/Avatar/Avatar';
import {ThunkDispatch} from 'redux-thunk';
import {ProfileServiceClient} from '../../clients/ProfileServiceClient';

interface ToolbarProps {
    userInitials: string;
    loggedInAsAdmin: boolean;
    statisticsAvailable: boolean;
    profilePictureSrc: string;
    viewProfiles: Array<ViewProfile>;
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
    statisticsOpen: boolean;
    profilesOpen: boolean;
    menuAnchorEl: any;
}

interface ToolbarDispatch {
    navigateTo(target: string): void;

    loadNetworkGraph(): void;

    loadConsultantClusterInfo(initials: string): void;

    loadSkillStatistics(): void;
}

class PowerToolbarModule extends React.Component<ToolbarProps & ToolbarLocalProps & ToolbarDispatch, ToolbarLocalState> {

    constructor(props: ToolbarProps & ToolbarLocalProps & ToolbarDispatch) {
        super(props);
        this.state = {
            menuOpen: false,
            statisticsOpen: false,
            profilesOpen: false,
            menuAnchorEl: null,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ToolbarLocalProps): ToolbarProps {
        const profilePictureSrc = ProfileServiceClient.instance().getProfilePictureUrl(state.profileStore.consultant.profilePictureId);
        return {
            userInitials: state.profileStore.consultant.initials,
            loggedInAsAdmin: state.adminReducer.loginStatus() === LoginStatus.SUCCESS,
            statisticsAvailable: state.statisticsReducer.available(),
            viewProfiles: state.viewProfileSlice.viewProfiles().toArray(),
            profilePictureSrc
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ToolbarDispatch {
        return {
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
            loadNetworkGraph: () => dispatch(StatisticsActionCreator.AsyncRequestNetwork()),
            loadConsultantClusterInfo: initials => dispatch(StatisticsActionCreator.AsyncRequestConsultantClusterInfo(initials)),
            loadSkillStatistics: () => dispatch(StatisticsActionCreator.AsyncRequestSkillUsages())
        };
    }

    private handleMenuOpen = (event: any) => {
        this.setState({menuOpen: true, menuAnchorEl: event.currentTarget});
    };

    private handleMenuClose = () => {
        this.setState({
            menuOpen: false,
            menuAnchorEl: null,
            statisticsOpen: false,
            profilesOpen: false
        });
    };

    private handleMenuNavigate = (target: string) => {
        this.handleMenuClose();
        this.props.navigateTo(target);
    };
    private getInitials = () => {
        return this.props.userInitials;
    };


    private renderPower = () => {
        return (
            <div className="vertical-align" style={{height: '100%', flexGrow: 1}}>
                <img className="img-responsive logo-small" src={getImagePath() + '/HBT002_Logo_neg.png'}
                />
            </div>
        );
    };

    private loadNetworkGraph = () => {
        // FIXME move this into the async action.
        this.handleMenuClose();
        this.props.loadNetworkGraph();
        this.props.navigateTo(Paths.USER_STATISTICS_NETWORK);
    };

    private loadConsultantClusterInfo = () => {
        // FIXME move this into the async action.
        this.handleMenuClose();
        this.props.loadConsultantClusterInfo(this.props.userInitials);
        this.props.navigateTo(Paths.USER_STATISTICS_CLUSTERINFO);
    };

    private loadSkillStatistics = () => {
        // FIXME move this into the async action.
        this.handleMenuClose();
        this.props.loadSkillStatistics();
        this.props.navigateTo(Paths.USER_STATISTICS_SKILLS);
    };

    private logOutUser = () => {
        this.props.navigateTo(Paths.USER_SPECIAL_LOGOUT);
    };

    private renderViewProfile = (viewProfile: ViewProfile) => {
        let text = viewProfile.viewProfileInfo.name;
        if (text === null || text.trim() === '') {
            text = viewProfile.id;
        }
        return <MenuItem
            key={viewProfile.id}
            onClick={() => this.handleMenuNavigate(Paths.USER_VIEW_PROFILE.replace(':id', viewProfile.id))}
        >
            <ListItemText>
                {text}
            </ListItemText>
        </MenuItem>;
    };

    private renderMenu = () => {
        return (<div>

                <Menu
                    id={'menu'}
                    open={this.state.menuOpen}
                    anchorEl={this.state.menuAnchorEl}
                    onClose={() => this.handleMenuClose()}
                >
                    <MenuItem
                        key={'1'}
                        onClick={() => this.handleMenuNavigate(Paths.USER_HOME)}
                    >
                        <Icon className="material-icons">home</Icon>
                        <ListItemText>
                            {PowerLocalize.get('Menu.Home')}
                        </ListItemText>
                    </MenuItem>
                    <MenuItem
                        key={'2'}
                        onClick={() => this.handleMenuNavigate(Paths.USER_PROFILE)}
                    >
                        <Icon className="material-icons">person</Icon>
                        <ListItemText>
                            {PowerLocalize.get('Menu.BaseData')}
                        </ListItemText>
                    </MenuItem>

                    {this.props.viewProfiles.length > 0 ?
                        <div>
                            <MenuItem key={'3'} button
                                      onClick={() => this.setState({profilesOpen: !this.state.profilesOpen})}>
                                <Icon className="material-icons">remove_red_eye</Icon>
                                <ListItemText>{PowerLocalize.get('Menu.ViewProfile')}</ListItemText>
                                <Icon className="material-icons">keyboard_arrow_right</Icon>
                            </MenuItem>
                            <Collapse in={this.state.profilesOpen}>
                                {this.props.viewProfiles.map(this.renderViewProfile)}
                            </Collapse>
                        </div>
                        : null
                    }

                    {
                        this.props.statisticsAvailable ? (
                                <div>
                                    <MenuItem key={'5'} button
                                              onClick={() => this.setState({statisticsOpen: !this.state.statisticsOpen})}>
                                        <Icon className="material-icons">insert_chart</Icon>
                                        <ListItemText>{PowerLocalize.get('Menu.Statistics')}</ListItemText>
                                        <Icon className="material-icons">keyboard_arrow_right</Icon>
                                    </MenuItem>
                                    <Collapse in={this.state.statisticsOpen}>
                                        <MenuItem
                                            key="Menu.Statistics.Network"
                                            onClick={this.loadNetworkGraph}
                                        >
                                            <ListItemIcon>
                                                <Icon className="material-icons">collections</Icon>
                                            </ListItemIcon>
                                            <ListItemText>
                                                {PowerLocalize.get('Menu.Statistics.Network')}
                                            </ListItemText>
                                        </MenuItem>
                                        <MenuItem
                                            key="Menu.Statistics.Network.Clusterinfo"
                                            onClick={this.loadConsultantClusterInfo}
                                        >
                                            <ListItemIcon>
                                                <Icon className="material-icons">info</Icon>
                                            </ListItemIcon>
                                            <ListItemText>
                                                {PowerLocalize.get('Menu.Statistics.Network.Clusterinfo')}
                                            </ListItemText>
                                        </MenuItem>
                                        <MenuItem
                                            key="Menu.Statistics.Skills"
                                            onClick={this.loadSkillStatistics}
                                        >
                                            <ListItemIcon>
                                                <Icon className="material-icons">palette</Icon>
                                            </ListItemIcon>
                                            <ListItemText>
                                                {PowerLocalize.get('Menu.Statistics.Skills')}
                                            </ListItemText>
                                        </MenuItem>
                                    </Collapse>
                                </div>)
                            :
                            null
                    }
                    <MenuItem
                        key={'6'}
                        onClick={() => this.handleMenuNavigate(Paths.USER_REPORTS)}
                    >
                        <Icon className="material-icons">folder</Icon>
                        <ListItemText>
                            {PowerLocalize.get('Menu.Reports')}
                        </ListItemText>

                    </MenuItem>
                    <MenuItem
                        key={'7'}
                        onClick={() => this.handleMenuNavigate(Paths.USER_SEARCH)}
                    >
                        <Icon className="material-icons">search</Icon>
                        <ListItemText>
                            {PowerLocalize.get('Menu.Search')}
                        </ListItemText>

                    </MenuItem>
                </Menu>
            </div>
        );
    };

    /**
     * @returns {any}
     */
    render() {
        return (
            <div>
                <AppBar color={'primary'}>
                    <Toolbar>
                        <IconButton
                            onClick={(e: any) => {
                                this.handleMenuOpen(e);
                            }}
                            style={{color: 'white', marginLeft: -12, marginRight: 20}}
                        >
                            <Icon className="material-icons">menu</Icon>
                        </IconButton>
                        {this.renderMenu()}

                        {this.renderPower()}
                        <Tooltip title={PowerLocalize.get('Toolbar.LoggedInAs') + ' ' + this.getInitials()}>
                            <Avatar
                                src={this.props.profilePictureSrc}
                                style={{width: 40, height: 40}}
                            />
                        </Tooltip>
                        {
                            this.props.loggedInAsAdmin ?
                                <Tooltip title={PowerLocalize.get('Tooolbar.ToAdminOverview')}>
                                    <IconButton
                                        style={{'color': 'white'}}
                                        className="material-icons"
                                        onClick={() => this.handleMenuNavigate(Paths.ADMIN_CONSULTANTS)}
                                    >
                                        home
                                    </IconButton>
                                </Tooltip>
                                : null
                        }
                        <Tooltip title={PowerLocalize.get('Tooolbar.LogOut')}>
                            <IconButton
                                style={{'color': 'white'}}
                                className="material-icons"
                                onClick={this.logOutUser}
                            >
                                input
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

export const PowerToolbar = connect(PowerToolbarModule.mapStateToProps, PowerToolbarModule.mapDispatchToProps)(PowerToolbarModule);
