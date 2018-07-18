import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AppBar, Icon, IconButton, Menu, MenuItem, WithStyles} from '@material-ui/core';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {ProfileActionCreator} from '../../reducers/profile/ProfileActionCreator';
import {ConsultantInfo} from '../../model/ConsultantInfo';
import {isNullOrUndefined} from 'util';
import {LoginStatus} from '../../model/LoginStatus';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {StatisticsActionCreator} from '../../reducers/statistics/StatisticsActionCreator';
import {Paths} from '../../Paths';
import {NavigationActionCreator} from '../../reducers/navigation/NavigationActionCreator';
import {ApplicationState} from '../../reducers/reducerIndex';
import {Color} from '../../utils/ColorUtil';
import {ViewProfile} from '../../model/view/ViewProfile';
import {getImagePath} from '../../API_CONFIG';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import Collapse from '@material-ui/core/Collapse/Collapse';

interface ToolbarProps {
    loggedInUser: ConsultantInfo;
    loggedInAsAdmin: boolean;
    statisticsAvailable: boolean;
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
    statisticsOpen : boolean;
}

interface ToolbarDispatch {
    navigateTo(target: string): void;
    logOutUser(): void;
    loadNetworkGraph(): void;
    loadConsultantClusterInfo(initials: string): void;
    loadSkillStatistics(): void;
}

class PowerToolbarModule extends React.Component<ToolbarProps & ToolbarLocalProps & ToolbarDispatch, ToolbarLocalState> {

    constructor(props: ToolbarProps & ToolbarLocalProps & ToolbarDispatch) {
        super(props);
        this.state = {
            menuOpen: false,
            statisticsOpen: true,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ToolbarLocalProps) : ToolbarProps {
        return {
            loggedInUser: state.databaseReducer.loggedInUser(),
            loggedInAsAdmin: state.adminReducer.loginStatus() === LoginStatus.SUCCESS,
            statisticsAvailable: state.statisticsReducer.available(),
            viewProfiles: state.viewProfileSlice.viewProfiles().toArray()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>) : ToolbarDispatch {
        return {
            logOutUser: function() {
                dispatch(ProfileActionCreator.logOutUser());
                dispatch(AdminActionCreator.AsyncLogOutAdmin());
            },
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
            loadNetworkGraph: () => dispatch(StatisticsActionCreator.AsyncRequestNetwork()),
            loadConsultantClusterInfo: initials => dispatch(StatisticsActionCreator.AsyncRequestConsultantClusterInfo(initials)),
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
            <div className="vertical-align" style={{height: "100%"}}>
                <img className="img-responsive logo-small" src={getImagePath()+"/HBT002_Logo_neg.png"}
                />
            </div>
          );
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

    private renderViewProfile = (viewProfile: ViewProfile) => {
        let text = viewProfile.viewProfileInfo.name;
        if(text === null && text.trim() === "") {
            text = viewProfile.id;
        }
        return <MenuItem
            key={viewProfile.id}
            onClick={() => this.props.navigateTo(Paths.USER_VIEW_PROFILE.replace(":id", viewProfile.id))}
        >
            <ListItemText>
                {text}
            </ListItemText>
        </MenuItem>;
    };

    //TODO Menu -> IconButton
    private renderMenu = () => {
        return (<div>
            <IconButton onClick={()=>this.setState({menuOpen : !this.state.menuOpen})}>
                <Icon className="material-icons">menu</Icon>
            </IconButton>
            <Menu
                open={this.state.menuOpen}
                // iconStyle={{color:Color.HBT_2017_TEXT_WHITE.toCSSRGBString()}}
                // iconButtonElement={}
                // anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                // targetOrigin={{horizontal: 'left', vertical: 'top'}}
            >
                <MenuItem
                    onClick={() => this.props.navigateTo(Paths.USER_HOME)}
                >
                    <Icon className="material-icons">home</Icon>
                    <ListItemText>
                        {PowerLocalize.get('Menu.Home')}
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => this.props.navigateTo(Paths.USER_PROFILE)}
                >
                    <Icon className="material-icons">person</Icon>
                    <ListItemText>
                        {PowerLocalize.get('Menu.BaseData')}
                    </ListItemText>
                </MenuItem>
                {this.props.viewProfiles.length > 0 ?
                    <MenuItem>
                        <Icon className="material-icons">remove_red_eye</Icon>
                        <ListItemText>
                            {PowerLocalize.get('Menu.ViewProfile')}
                        </ListItemText>
                        <Icon className="material-icons">keyboard_arrow_right</Icon>

                        {this.props.viewProfiles.map(this.renderViewProfile)}
                    </MenuItem>

                    : null

                }

            {
                this.props.statisticsAvailable ? (
                    <div>
                    <MenuItem button onClick={()=> this.setState({statisticsOpen: !this.state.statisticsOpen})}>
                        <ListItemIcon>
                            <Icon className="material-icons">insert_chart</Icon>
                        </ListItemIcon>
                        <ListItemText primary={PowerLocalize.get('Menu.Statistics')}/>
                        <ListItemIcon>
                            <Icon className="material-icons">keyboard_arrow_right</Icon>
                        </ListItemIcon>
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
                    </div>
                )
                :
                null
            }
           <MenuItem
               onClick={() => this.props.navigateTo(Paths.USER_SEARCH)}
           >
               <ListItemIcon>
                   <Icon className="material-icons">search</Icon>
               </ListItemIcon>
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
        return(
            <AppBar>
                <Toolbar>

                    {this.renderMenu()}
                    {this.renderPower()}

                    <div style={{"color": "white"}}>
                        <span>
                              {PowerLocalize.get('Toolbar.LoggedInAs') + ' ' + this.getInitials()}
                        </span>
                        {
                            this.props.loggedInAsAdmin ?
                                <Tooltip title={PowerLocalize.get('Tooolbar.ToAdminOverview')}>
                                <IconButton
                                    style={{"color": "white"}}
                                    className="material-icons"
                                    onClick={() => this.props.navigateTo(Paths.ADMIN_CONSULTANTS)}
                                >
                                    home
                                </IconButton>
                                </Tooltip>
                                : null
                        }

                        <IconButton
                            style={{"color": "white"}}
                            //tooltip={PowerLocalize.get('Tooolbar.LogOut')}
                            className="material-icons"
                            onClick={this.logOutUser}
                        >
                            input
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
        );
    }
}

export const PowerToolbar: React.ComponentClass<ToolbarLocalProps> = connect(PowerToolbarModule.mapStateToProps, PowerToolbarModule.mapDispatchToProps)(PowerToolbarModule);