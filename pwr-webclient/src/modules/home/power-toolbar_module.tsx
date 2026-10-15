import {connect} from 'react-redux';
import * as React from 'react';
import {AppBar, FormControl, Icon, IconButton, Menu, MenuItem, Select} from '@material-ui/core';
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
import Avatar from '@material-ui/core/Avatar/Avatar';
import {ThunkDispatch} from 'redux-thunk';
import {ProfileServiceClient} from '../../clients/ProfileServiceClient';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {ConsultantInfoDTO} from '../../model/ConsultantInfoDTO';
import {CrossCuttingAsyncActionCreator} from '../../reducers/crosscutting/CrossCuttingAsyncActionCreator';
import {withRouter} from 'react-router-dom';

interface ToolbarProps {
    loggedInAsAdmin: boolean;
    hasProfilePicture: boolean;
    statisticsAvailable: boolean;
    profilePictureSrc: string;
    viewProfiles: Array<ViewProfile>;
    consultantInfo: ConsultantInfoDTO[];
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface ToolbarLocalProps {
    match?: any;
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
    navigateToAdmin(): void;

    loadConsultantClusterInfo(initials: string): void;

    loadSkillStatistics(): void;

    changeConsultant(initials: string): void;
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

    static mapStateToProps(state: ApplicationState, _: ToolbarLocalProps): ToolbarProps {
        const profilePictureSrc = ProfileServiceClient.instance().getProfilePictureUrl(state.profileStore.consultant.profilePictureId);
        return {
            loggedInAsAdmin: state.adminReducer.loginStatus === LoginStatus.SUCCESS,
            statisticsAvailable: state.statisticsReducer.available,
            viewProfiles: state.viewProfileSlice.viewProfiles.toArray(),
            profilePictureSrc,
            hasProfilePicture: !!state.profileStore.consultant.profilePictureId,
            consultantInfo: [...state.adminReducer.consultantInfo].sort((a, b) => a.name.localeCompare(b.name))
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ToolbarDispatch {
        return {
            navigateToAdmin: () => dispatch(AdminActionCreator.AsyncNavigateToAdmin()),
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
            loadConsultantClusterInfo: initials => dispatch(StatisticsActionCreator.AsyncRequestConsultantClusterInfo(initials)),
            loadSkillStatistics: () => dispatch(StatisticsActionCreator.AsyncRequestSkillUsages()),
            changeConsultant: (initials: string) => dispatch(CrossCuttingAsyncActionCreator.AsyncLoadProfile(initials)),
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


    private renderPower = () => {
        return (
            <div className="vertical-align" style={{height: '100%', flexGrow: 1}}>
                <img alt="HBT Power Logo" className="img-responsive logo-small" src={getImagePath() + '/HBT002_Logo_neg.png'}/>
            </div>
        );
    };

    private loadConsultantClusterInfo = (initials: string) => {
        this.handleMenuClose();
        this.props.loadConsultantClusterInfo(initials);
        this.props.navigateTo(Paths.build(Paths.USER_STATISTICS_CLUSTERINFO, {initials}));
    };

    private loadSkillStatistics = (initials: string) => {
        this.handleMenuClose();
        this.props.loadSkillStatistics();
        this.props.navigateTo(Paths.build(Paths.USER_STATISTICS_SKILLS, {initials}));
    };

    private logOutUser = () => {
        this.props.navigateTo(Paths.USER_SPECIAL_LOGOUT);
    };

    private renderViewProfile = (viewProfile: ViewProfile, initials: string) => {
        let text = viewProfile.viewProfileInfo.name;
        if (!text) {
            text = viewProfile.id;
        }
        return <MenuItem
            key={viewProfile.id}
            onClick={() => this.handleMenuNavigate(Paths.build(Paths.USER_VIEW_PROFILE, {id: viewProfile.id, initials}))}
        >
            <ListItemText>
                {text}
            </ListItemText>
        </MenuItem>;
    };

    private renderMenu = (initials: string) => {
        return (<div>

                <Menu
                    id={'menu'}
                    open={this.state.menuOpen}
                    anchorEl={this.state.menuAnchorEl}
                    onClose={() => this.handleMenuClose()}
                >
                    <MenuItem
                        key={'1'}
                        onClick={() => this.handleMenuNavigate(Paths.build(Paths.USER_HOME, {initials}))}
                    >
                        <Icon className="material-icons">home</Icon>
                        <ListItemText>
                            {PowerLocalize.get('Menu.Home')}
                        </ListItemText>
                    </MenuItem>
                    <MenuItem
                        key={'2'}
                        onClick={() => this.handleMenuNavigate(Paths.build(Paths.USER_PROFILE, {initials}))}
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
                                {this.props.viewProfiles.map(vp => this.renderViewProfile(vp, initials))}
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
                                            key="Menu.Statistics.Network.Clusterinfo"
                                            onClick={() => this.loadConsultantClusterInfo(initials)}
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
                                            onClick={() => this.loadSkillStatistics(initials)}
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
                        onClick={() => this.handleMenuNavigate(Paths.build(Paths.USER_REPORTS, {initials}))}
                    >
                        <Icon className="material-icons">folder</Icon>
                        <ListItemText>
                            {PowerLocalize.get('Menu.Reports')}
                        </ListItemText>

                    </MenuItem>
                    <MenuItem
                        key={'7'}
                        onClick={() => this.handleMenuNavigate(Paths.build(Paths.USER_SEARCH, {initials}))}
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
        const initials = this.props.match.params.initials;
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
                        {this.renderMenu(initials)}

                        {this.renderPower()}
                        {
                            this.props.hasProfilePicture ?
                                <Tooltip title={PowerLocalize.get('Toolbar.LoggedInAs') + ' ' + initials}>
                                    <Avatar
                                      src={this.props.profilePictureSrc}
                                      style={{width: 40, height: 40}}
                                    />
                                </Tooltip>
                              : null
                        }
                        {
                            this.props.loggedInAsAdmin ?
                                <Tooltip title={PowerLocalize.get('Tooolbar.ToAdminOverview')}>
                                    <IconButton
                                        style={{'color': 'white'}}
                                        className="material-icons"
                                        onClick={() => this.props.navigateToAdmin()}
                                    >
                                        home
                                    </IconButton>
                                </Tooltip>
                                : null
                        }
                        {
                            this.props.loggedInAsAdmin && this.props.consultantInfo.length >= 1 ?
                              <FormControl>
                                <Select rowsMax={15}
                                        className="select-in-toolbar"
                                        value={initials}
                                        defaultValue=""
                                        onChange={(event) => this.props.changeConsultant(event.target.value as string)}
                                >
                                    {
                                        this.props.consultantInfo.map(consultantInfo => <MenuItem key={consultantInfo.initials} value={consultantInfo.initials}>{consultantInfo.name}</MenuItem> )
                                    }
                                </Select>
                              </FormControl>
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

const WithRouterComponent = withRouter((props: any) => <PowerToolbarModule {...props}/>);

export const PowerToolbar = connect(PowerToolbarModule.mapStateToProps, PowerToolbarModule.mapDispatchToProps)(WithRouterComponent);
