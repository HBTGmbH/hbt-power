import {connect} from 'react-redux';
import * as React from 'react';
import {AppBar, Divider, FormControl, Icon, IconButton, Menu, MenuItem, Select} from '@material-ui/core';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {LoginStatus} from '../../model/LoginStatus';
import {StatisticsActionCreator} from '../../reducers/statistics/StatisticsActionCreator';
import {Paths} from '../../Paths';
import {NavigationActionCreator} from '../../reducers/navigation/NavigationActionCreator';
import {ApplicationState} from '../../reducers/reducerIndex';
import {ViewProfile} from '../../model/view/ViewProfile';
import {PwrBrand} from '../general/pwr-brand';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import Collapse from '@material-ui/core/Collapse/Collapse';
import {ThunkDispatch} from 'redux-thunk';
import {AppInfoButton, AppInfoDialog, LoggedInUserAvatar} from '../metadata/app-info_module';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {ConsultantInfoDTO} from '../../model/ConsultantInfoDTO';
import {matchPath, withRouter} from 'react-router-dom';
import {ProfileStore} from '../../reducers/profile-new/ProfileStore';
import {projectsUrl} from './profile/elements/project/project-url-sync';

interface ToolbarProps {
    loggedInAsAdmin: boolean;
    statisticsAvailable: boolean;
    viewProfiles: Array<ViewProfile>;
    consultantInfo: ConsultantInfoDTO[];
    profileStore: ProfileStore;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface ToolbarLocalProps {
    match?: any;
    location?: any;
}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface ToolbarLocalState {
    menuOpen: boolean;
    appInfoOpen: boolean;
    baseDataOpen: boolean;
    statisticsOpen: boolean;
    profilesOpen: boolean;
    menuAnchorEl: any;
}

interface ToolbarDispatch {
    navigateTo(target: string): void;
    navigateToAdmin(): void;

    loadConsultantClusterInfo(initials: string): void;

}

class PowerToolbarModule extends React.Component<ToolbarProps & ToolbarLocalProps & ToolbarDispatch, ToolbarLocalState> {

    constructor(props: ToolbarProps & ToolbarLocalProps & ToolbarDispatch) {
        super(props);
        this.state = {
            menuOpen: false,
            appInfoOpen: false,
            baseDataOpen: false,
            statisticsOpen: false,
            profilesOpen: false,
            menuAnchorEl: null,
        };
    }

    static mapStateToProps(state: ApplicationState, _: ToolbarLocalProps): ToolbarProps {
        return {
            loggedInAsAdmin: state.adminReducer.loginStatus === LoginStatus.SUCCESS,
            statisticsAvailable: state.statisticsReducer.available,
            viewProfiles: state.viewProfileSlice.viewProfiles.toArray(),
            consultantInfo: [...state.adminReducer.consultantInfo].sort((a, b) => a.name.localeCompare(b.name)),
            profileStore: state.profileStore
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ToolbarDispatch {
        return {
            navigateToAdmin: () => dispatch(AdminActionCreator.AsyncNavigateToAdmin()),
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
            loadConsultantClusterInfo: initials => dispatch(StatisticsActionCreator.AsyncRequestConsultantClusterInfo(initials)),
        };
    }

    private handleMenuOpen = (event: any) => {
        // On a base data page its sub-navigation is open, so the current section is visible
        const baseDataOpen = !!matchPath(this.props.location.pathname, {path: Paths.USER_PROFILE});
        this.setState({menuOpen: true, menuAnchorEl: event.currentTarget, baseDataOpen});
    };

    private handleMenuClose = () => {
        this.setState({
            menuOpen: false,
            menuAnchorEl: null,
            baseDataOpen: false,
            statisticsOpen: false,
            profilesOpen: false
        });
    };

    private handleMenuNavigate = (target: string) => {
        this.handleMenuClose();
        this.props.navigateTo(target);
    };


    /**
     * Switches to the consultant by changing the route; power-client_module loads the profile for the new initials.
     * Stays on the current page unless it shows data that belongs to the previous consultant.
     */
    private changeConsultant = (initials: string) => {
        const pagesForAnyConsultant = [Paths.USER_HOME, Paths.USER_PROFILE, Paths.USER_PROFILE_PROJECTS, Paths.USER_PROFILE_SKILLS,
            Paths.USER_REPORTS, Paths.USER_SEARCH, Paths.USER_STATISTICS_SKILLS];
        const pathname = this.props.location.pathname;
        let currentPage = pagesForAnyConsultant.find(path => matchPath(pathname, {path, exact: true}));
        if (!currentPage && matchPath(pathname, {path: Paths.USER_PROFILE_PROJECTS})) {
            // A selected project belongs to the previous consultant: show the project list of the new one
            currentPage = Paths.USER_PROFILE_PROJECTS;
        }
        this.props.navigateTo(Paths.build(currentPage || Paths.USER_HOME, {initials}));
    };

    private loadConsultantClusterInfo = (initials: string) => {
        this.handleMenuClose();
        this.props.loadConsultantClusterInfo(initials);
        this.props.navigateTo(Paths.build(Paths.USER_STATISTICS_CLUSTERINFO, {initials}));
    };

    private loadSkillStatistics = (initials: string) => {
        this.handleMenuClose();
        this.props.navigateTo(Paths.build(Paths.USER_STATISTICS_SKILLS, {initials}));
    };

    private logOutUser = () => {
        this.handleMenuClose();
        this.props.navigateTo(Paths.USER_SPECIAL_LOGOUT);
    };

    private openAppInfo = () => {
        this.handleMenuClose();
        this.setState({appInfoOpen: true});
    };

    private navigateToAdmin = () => {
        this.handleMenuClose();
        this.props.navigateToAdmin();
    };

    private renderViewProfile = (viewProfile: ViewProfile, initials: string) => {
        let text = viewProfile.viewProfileInfo.name;
        if (!text) {
            text = viewProfile.id;
        }
        return <MenuItem
            key={viewProfile.id}
            className="pwr-menu-subitem"
            onClick={() => this.handleMenuNavigate(Paths.build(Paths.USER_VIEW_PROFILE, {id: viewProfile.id, initials}))}
        >
            <ListItemText inset>
                {text}
            </ListItemText>
        </MenuItem>;
    };

    private renderExpandIcon = (open: boolean) => {
        return <Icon className="material-icons">{open ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}</Icon>;
    };

    /**
     * The section of the base data page that the current URL shows: projects and skills have their own paths,
     * everything else under the profile path is the consultant section.
     */
    private currentBaseDataSection(): string | undefined {
        const pathname = this.props.location.pathname;
        return [Paths.USER_PROFILE_PROJECTS, Paths.USER_PROFILE_SKILLS, Paths.USER_PROFILE]
            .find(path => matchPath(pathname, {path}));
    }

    private renderBaseDataSection = (section: string, target: string, icon: string, localizationKey: string) => {
        return <MenuItem
            key={localizationKey}
            className="pwr-menu-subitem"
            selected={this.currentBaseDataSection() === section}
            onClick={() => this.handleMenuNavigate(target)}
        >
            <ListItemIcon>
                <Icon className="material-icons">{icon}</Icon>
            </ListItemIcon>
            <ListItemText>
                {PowerLocalize.get(localizationKey)}
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
                        <ListItemIcon>
                            <Icon className="material-icons">home</Icon>
                        </ListItemIcon>
                        <ListItemText>
                            {PowerLocalize.get('Menu.Home')}
                        </ListItemText>
                    </MenuItem>
                    <MenuItem key={'2'} button
                              onClick={() => this.setState({baseDataOpen: !this.state.baseDataOpen})}>
                        <ListItemIcon>
                            <Icon className="material-icons">person</Icon>
                        </ListItemIcon>
                        <ListItemText>
                            {PowerLocalize.get('Menu.BaseData')}
                        </ListItemText>
                        {this.renderExpandIcon(this.state.baseDataOpen)}
                    </MenuItem>
                    <Collapse in={this.state.baseDataOpen}>
                        {this.renderBaseDataSection(Paths.USER_PROFILE, Paths.build(Paths.USER_PROFILE, {initials}),
                            'account_box', 'Menu.BaseData.Consultant')}
                        {this.renderBaseDataSection(Paths.USER_PROFILE_PROJECTS, projectsUrl(initials, this.props.profileStore),
                            'work', 'Menu.BaseData.Projects')}
                        {this.renderBaseDataSection(Paths.USER_PROFILE_SKILLS, Paths.build(Paths.USER_PROFILE_SKILLS, {initials}),
                            'star', 'Menu.BaseData.Skills')}
                    </Collapse>

                    {this.props.viewProfiles.length > 0 ?
                        <div>
                            <MenuItem key={'3'} button
                                      onClick={() => this.setState({profilesOpen: !this.state.profilesOpen})}>
                                <ListItemIcon>
                                    <Icon className="material-icons">remove_red_eye</Icon>
                                </ListItemIcon>
                                <ListItemText>{PowerLocalize.get('Menu.ViewProfile')}</ListItemText>
                                {this.renderExpandIcon(this.state.profilesOpen)}
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
                                        <ListItemIcon>
                                            <Icon className="material-icons">insert_chart</Icon>
                                        </ListItemIcon>
                                        <ListItemText>{PowerLocalize.get('Menu.Statistics')}</ListItemText>
                                        {this.renderExpandIcon(this.state.statisticsOpen)}
                                    </MenuItem>
                                    <Collapse in={this.state.statisticsOpen}>
                                        <MenuItem
                                            key="Menu.Statistics.Network.Clusterinfo"
                                            className="pwr-menu-subitem"
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
                                            className="pwr-menu-subitem"
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
                        <ListItemIcon>
                            <Icon className="material-icons">folder</Icon>
                        </ListItemIcon>
                        <ListItemText>
                            {PowerLocalize.get('Menu.Reports')}
                        </ListItemText>

                    </MenuItem>
                    <MenuItem
                        key={'7'}
                        onClick={() => this.handleMenuNavigate(Paths.build(Paths.USER_SEARCH, {initials}))}
                    >
                        <ListItemIcon>
                            <Icon className="material-icons">search</Icon>
                        </ListItemIcon>
                        <ListItemText>
                            {PowerLocalize.get('Menu.Search')}
                        </ListItemText>

                    </MenuItem>
                    <Divider/>
                    {/* Only on narrow screens, where the info icon in the app bar is hidden (#127) */}
                    <MenuItem key={'7a'} className="pwr-only-narrow" onClick={this.openAppInfo}>
                        <ListItemIcon>
                            <Icon className="material-icons">info_outline</Icon>
                        </ListItemIcon>
                        <ListItemText>
                            {PowerLocalize.get('AppInfo.Title')}
                        </ListItemText>
                    </MenuItem>
                    {this.props.loggedInAsAdmin &&
                    <MenuItem key={'8'} onClick={this.navigateToAdmin}>
                        <ListItemIcon>
                            <Icon className="material-icons">admin_panel_settings</Icon>
                        </ListItemIcon>
                        <ListItemText>
                            {PowerLocalize.get('Tooolbar.ToAdminOverview')}
                        </ListItemText>
                    </MenuItem>}
                    <MenuItem key={'9'} onClick={this.logOutUser}>
                        <ListItemIcon>
                            <Icon className="material-icons">input</Icon>
                        </ListItemIcon>
                        <ListItemText>
                            {PowerLocalize.get('Tooolbar.LogOut')}
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
                        <AppInfoDialog open={this.state.appInfoOpen} onClose={() => this.setState({appInfoOpen: false})}/>

                        <PwrBrand/>
                        {
                            this.props.loggedInAsAdmin && this.props.consultantInfo.length >= 1 ?
                              <FormControl>
                                <Select rowsMax={15}
                                        className="select-in-toolbar"
                                        value={initials}
                                        defaultValue=""
                                        onChange={(event) => this.changeConsultant(event.target.value as string)}
                                >
                                    {
                                        this.props.consultantInfo.map(consultantInfo => <MenuItem key={consultantInfo.initials} value={consultantInfo.initials}>{consultantInfo.name}</MenuItem> )
                                    }
                                </Select>
                              </FormControl>
                              : null
                        }
                        {/* From the right: log out, logged in user, info, colleagues */}
                        <AppInfoButton/>
                        <LoggedInUserAvatar/>
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
