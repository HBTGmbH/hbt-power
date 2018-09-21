import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import IconButton from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem/ListItem';
import Icon from '@material-ui/core/Icon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {RequestStatus} from '../../Store';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {RequestSnackbar} from '../general/request-snackbar_module.';
import {Paths} from '../../Paths';
import {Link, Route} from 'react-router-dom';
import {ApplicationState} from '../../reducers/reducerIndex';
import {getImagePath} from '../../API_CONFIG';
import {NotificationInbox} from './notification/notification-inbox_module';
import {NotificationTrashbox} from './notification/notification-trashbox_module';
import {ConsultantGrid} from './consultants/consultant-grid_module';
import {SkillStatistics} from '../home/statistics/skill-statistics_module';
import {ProfileNetwork} from './statistics/profile-network_module';
import {AdminSkillTree2} from './info/tree/admin-skill-tree2_module';
import {AdminProfileOverview} from './info/admin-profile-overview_module.';
import {NavigationActionCreator} from '../../reducers/navigation/NavigationActionCreator';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader';
import Divider from '@material-ui/core/Divider/Divider';
import {ReportManager} from './reportmanager/report-manager_module';
import {TemplateActionCreator} from '../../reducers/template/TemplateActionCreator';


/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link AdminClient.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface AdminClientProps {
    requestStatus: RequestStatus;
    username: string;
    password: string;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link AdminClientProps} and will then be
 * managed by redux.
 */
interface AdminClientLocalProps {
    listOpen1: boolean;
    listOpen2: boolean;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface AdminClientLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface AdminClientDispatch {
    getNotifications(user: string, pass: string): void;
    navigateToTrashbox(user: string, pass: string): void;
    navigateToInbox(user: string, pass: string): void;
    navigateToConsultants(): void;
    navigateToReportManager():void;
    navigateToSkillStatistics(): void;
    navigateToNetwork(): void;
    logOutAdmin(): void;
}

class AdminClientModule extends React.Component<
    AdminClientProps
    & AdminClientLocalProps
    & AdminClientDispatch, AdminClientLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: AdminClientLocalProps): AdminClientProps {
        return {
            requestStatus: state.adminReducer.requestStatus(),
            username: state.adminReducer.adminName(),
            password: state.adminReducer.adminPass()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): AdminClientDispatch {
        return {
            getNotifications: (user, pass) => {dispatch(AdminActionCreator.AsyncRequestNotifications(user, pass));},
            navigateToInbox: (user, pass) => {dispatch(AdminActionCreator.AsyncNavigateToInbox(user, pass));},
            navigateToTrashbox: (user, pass) => {dispatch(AdminActionCreator.AsyncNavigateToTrashbox(user, pass));},
            navigateToConsultants: () => {dispatch(TemplateActionCreator.AsyncLoadAllTemplates());dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.ADMIN_CONSULTANTS));},
            navigateToReportManager: () => {dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.ADMIN_TEMPLATES));},
            navigateToSkillStatistics: () => {dispatch(AdminActionCreator.AsyncNavigateToStatistics());},
            logOutAdmin: () => {dispatch(AdminActionCreator.AsyncLogOutAdmin());},
            navigateToNetwork: () => {dispatch(AdminActionCreator.AsyncNavigateToNetwork());}
        };
    }

    private handleInboxButtonClick = () => {
        this.props.navigateToInbox(this.props.username, this.props.password);
    };

    private handleTrashboxButtonClick = () => {
        this.props.navigateToTrashbox(this.props.username, this.props.password);
    };

    render() {
        return (
            <div>
                <div className="row vertical-align">
                    <Paper elevation={3}>
                        <AppBar>
                            <Toolbar>
                                <div className="vertical-align" style={{flexGrow:1}} >
                                    <img className="img-responsive logo-small" src={getImagePath()+'/HBT002_Logo_neg.png'}/>
                                </div>
                                <IconButton color={'secondary'} onClick={this.props.logOutAdmin} >
                                    <Icon   className={"material-icons"}> input</Icon>
                                </IconButton>
                            </Toolbar>
                        </AppBar>
                    </Paper>
                </div>

                <div className="row">
                    <div className="col-md-2">
                        <Paper  style={{marginTop:'70px'}}>
                            <List>
                                <ListSubheader>Postkorb</ListSubheader>
                                    <ListItem
                                        button
                                        key="AdminClient.Overview.Mail.Inbox"
                                        onClick={this.handleInboxButtonClick}
                                    >
                                        <ListItemIcon>
                                            <Icon className="material-icons">inbox</Icon>
                                        </ListItemIcon>
                                        <ListItemText primary={PowerLocalize.get("AdminClient.Menu.Inbox")}/>
                                    </ListItem>
                                    <ListItem
                                        button
                                        key="AdminClient.Overview.Mail.Trashbin"
                                        onClick={this.handleTrashboxButtonClick}
                                    >
                                        <ListItemIcon>
                                            <Icon className="material-icons">delete</Icon>
                                        </ListItemIcon>
                                        <ListItemText primary={PowerLocalize.get("AdminClient.Menu.Trashbin")}/>
                                    </ListItem>

                            <Divider/>
                                <ListSubheader>Mitarbeiter</ListSubheader>
                                <ListItem
                                    button
                                    key = "Berater"
                                    onClick={this.props.navigateToConsultants}
                                >
                                    <ListItemIcon>
                                        <Icon className="material-icons">people</Icon>
                                    </ListItemIcon>
                                    <ListItemText primary={"Berater"}/>
                                </ListItem>
                                <ListItem
                                    button
                                    key = "Templates"
                                    onClick={this.props.navigateToReportManager}
                                >
                                    <ListItemIcon>
                                        <Icon className="material-icons">description</Icon>
                                    </ListItemIcon>
                                    <ListItemText primary={"Report Manager"}/>
                                </ListItem>
                            <Divider/>
                                <ListSubheader>Informationen</ListSubheader>
                                    <List>
                                        <Link to={Paths.ADMIN_INFO_NAME_ENTITY} key={ "Link01"} style={{textDecoration:"none"}}>
                                            <ListItem
                                                button
                                                key="AdminClient.Menu.Info.ProfileElements"
                                            >
                                                <ListItemIcon>
                                                    <Icon className="material-icons">dehaze</Icon>
                                                </ListItemIcon>
                                                <ListItemText primary={PowerLocalize.get('AdminClient.Menu.Info.ProfileElements')}/>
                                            </ListItem>
                                        </Link>
                                        <Link to={Paths.ADMIN_INFO_SKILLTREE} style={{textDecoration:"none"}}>
                                            <ListItem
                                                button
                                                key="AdminClient.Menu.Info.SkillTree"
                                            >
                                                <ListItemIcon>
                                                    <Icon className="material-icons">device_hub</Icon>
                                                </ListItemIcon>
                                                <ListItemText primary={PowerLocalize.get('AdminClient.Menu.Info.SkillTree')}/>
                                            </ListItem>
                                        </Link>
                                    </List>
                                <Divider/>
                                <ListSubheader>Statistiken</ListSubheader>
                                        <ListItem
                                            button
                                            key="AdminClient.Menu.Statistics.Skills"
                                            onClick={this.props.navigateToSkillStatistics}
                                        >
                                            <ListItemIcon>
                                                <Icon className="material-icons">palette</Icon>
                                            </ListItemIcon>
                                            <ListItemText primary={PowerLocalize.get('AdminClient.Menu.Statistics.Skills')}/>
                                        </ListItem>
                                        <ListItem
                                            button
                                            key="AdminClient.Menu.Statistics.Network"
                                            onClick={this.props.navigateToNetwork}
                                        >
                                            <ListItemIcon>
                                                <Icon className="material-icons">collections</Icon>
                                            </ListItemIcon>
                                            <ListItemText primary={PowerLocalize.get('AdminClient.Menu.Statistics.Network')}/>
                                        </ListItem>
                            </List>
                        </Paper>
                    </div>
                    <div className="col-md-9 fittingContainer admin-app-bar-spacer">
                        <Route path={Paths.ADMIN_INBOX} component={NotificationInbox} />
                        <Route path={Paths.ADMIN_CONSULTANTS} component={ConsultantGrid} />
                        <Route path={Paths.ADMIN_TEMPLATES} component={ReportManager} />
                        <Route path={Paths.ADMIN_TRASHBOX} component={NotificationTrashbox} />
                        <Route path={Paths.ADMIN_STATISTICS_SKILL} component={SkillStatistics} />
                        <Route path={Paths.ADMIN_STATISTICS_NETWORK} component={ProfileNetwork} />
                        <Route path={Paths.ADMIN_INFO_SKILLTREE} component={AdminSkillTree2} />
                        <Route path={Paths.ADMIN_INFO_NAME_ENTITY} component={AdminProfileOverview} />
                    </div>
                    <RequestSnackbar APIRequestStatus={this.props.requestStatus}/>
                </div>
            </div>);
    }
}

/**
 * @see AdminClientModule
 * @author nt
 * @since 30.05.2017
 */
export const AdminClient = connect(AdminClientModule.mapStateToProps, AdminClientModule.mapDispatchToProps)(AdminClientModule);