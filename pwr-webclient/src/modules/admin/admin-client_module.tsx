import {connect} from 'react-redux';
import * as React from 'react';
import IconButton from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Paper from '@material-ui/core/Paper';
import Icon from '@material-ui/core/Icon';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Paths} from '../../Paths';
import {Redirect, Route, Switch} from 'react-router-dom';
import {ApplicationState} from '../../reducers/reducerIndex';
import {PwrBrand} from '../general/pwr-brand';
import {ConsultantGrid} from './consultants/consultant-grid_module';
import {SkillStatistics} from '../home/statistics/skill-statistics_module';
import {AdminSkillTree2} from './info/tree/admin-skill-tree2_module';
import {NameEntityOverview} from './info/name-entity/name-entity-overview_module';
import {UsedSkillOverview} from './info/skill/used-skill-overview_module';
import {NavigationActionCreator} from '../../reducers/navigation/NavigationActionCreator';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import {ReportManager} from './reportmanager/report-manager_module';
import {ProfileLoadingSpinner} from '../home/profile/profile-loading-spinner_module';
import {AppInfoButton, LoggedInUserAvatar} from '../metadata/app-info_module';
import {ThunkDispatch} from 'redux-thunk';
import {AdminMenu} from './admin-menu';
import {Housekeeping} from './housekeeping/housekeeping_module';


/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link AdminClient.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface AdminClientProps {
}

/**
 * Local properties of this module.
 */
interface AdminClientLocalProps {
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface AdminClientDispatch {
    logOutAdmin(): void;
}

/**
 * The admin area: the menu behind the burger in the app bar like in the profile area (#212), the page in the full
 * width below
 */
class AdminClientModule extends React.Component<AdminClientProps
    & AdminClientLocalProps
    & AdminClientDispatch> {

    static mapStateToProps(_: ApplicationState, __: AdminClientLocalProps): AdminClientProps {
        return {};
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): AdminClientDispatch {
        return {
            // Through the logout of the profile area (#211), which also asks about unsaved changes
            logOutAdmin: () => dispatch(NavigationActionCreator.AsyncNavigateTo(Paths.USER_SPECIAL_LOGOUT))
        };
    }

    render() {
        return (
            <div>
                <div className="row vertical-align">
                    <Paper elevation={3}>
                        <AppBar>
                            <Toolbar>
                                <AdminMenu onLogOut={this.props.logOutAdmin}/>
                                <PwrBrand/>
                                <AppInfoButton/>
                                <LoggedInUserAvatar/>
                                <Tooltip title={PowerLocalize.get('Tooolbar.LogOut')}>
                                    <IconButton color={'secondary'} aria-label={PowerLocalize.get('Tooolbar.LogOut')}
                                                onClick={this.props.logOutAdmin}>
                                        <Icon className={'material-icons'}> input</Icon>
                                    </IconButton>
                                </Tooltip>
                            </Toolbar>
                        </AppBar>
                    </Paper>
                </div>

                {/* No "row": its negative margin would put the pages right at the edge of the window, now that there
                    is no menu column on the left any more (#212) */}
                <div>
                    <div className="col-md-12 fittingContainer admin-app-bar-spacer">
                        {/* The admin area without a page starts in the consultant management (#263), so do old links
                            to the inbox and the trash, which are gone (#307) */}
                        <Switch>
                            <Route exact path={[Paths.ADMIN_BASE, Paths.ADMIN_BASE + 'home', Paths.ADMIN_BASE + 'home/inbox',
                                Paths.ADMIN_BASE + 'home/trashbox']}>
                                <Redirect to={Paths.ADMIN_CONSULTANTS}/>
                            </Route>
                        </Switch>
                        <Route path={Paths.ADMIN_CONSULTANTS} component={ConsultantGrid}/>
                        <Route path={Paths.ADMIN_TEMPLATES} component={ReportManager}/>
                        <Route path={Paths.ADMIN_STATISTICS_SKILL} component={SkillStatistics}/>
                        <Route path={Paths.ADMIN_INFO_SKILLTREE} component={AdminSkillTree2}/>
                        <Route path={Paths.ADMIN_INFO_NAME_ENTITY} component={NameEntityOverview}/>
                        <Route path={Paths.ADMIN_INFO_USED_SKILLS} component={UsedSkillOverview}/>
                        <Route path={Paths.ADMIN_HOUSEKEEPING} component={Housekeeping}/>
                    </div>
                    <ProfileLoadingSpinner/>
                </div>
            </div>);
    }
}

/**
 * @see AdminClientModule
 * @author nt
 * @since 30.05.2017
 */
export const AdminClient = connect(AdminClientModule.mapStateToProps, AdminClientModule.mapDispatchToProps)(AdminClientModule) as any;
