import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import reducerApp from './reducers/reducerIndex';
import {applyMiddleware, createStore} from 'redux';
import {Provider} from 'react-redux';

import thunkMiddleware from 'redux-thunk';
import {PowerClient} from './modules/home/power-client_module';
import {PowerLocalize} from './localization/PowerLocalizer';
import {ProfileAsyncActionCreator} from './reducers/profile/ProfileAsyncActionCreator';
import {PowerLogin} from './modules/power-login_module';
import {browserHistory, Route, Router} from 'react-router';
import {PowerOverview} from './modules/home/power-overview_module';
import {ConsultantProfile} from './modules/home/profile/profile_module';
import {ViewProfileCard} from './modules/home/view/view-profile_module';
import {NotificationInbox} from './modules/admin/notification-inbox_module';
import {AdminClient} from './modules/admin/admin-client_module';
import {NotificationTrashbox} from './modules/admin/notification-trashbox_module';
import {AdminLogin} from './modules/admin/admin-login_module';
import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';
import {COOKIE_INITIALS_EXPIRATION_TIME, COOKIE_INITIALS_NAME} from './model/PwrConstants';
import {isNullOrUndefined} from 'util';
import * as Cookies from 'js-cookie';
import {ConsultantGrid} from './modules/admin/consultants/consultant-grid_module';
import {SkillStatistics} from './modules/home/statistics/skill-statistics_module';
import {ProfileNetwork} from './modules/admin/statistics/profile-network_module';
import {StatisticsActionCreator} from './reducers/statistics/StatisticsActionCreator';
import {ProfileNetworkGraph} from './modules/general/statistics/profile-network_module';
import {ClusterResult} from './modules/home/statistics/cluster-result_module';
import {ConsultantSkillSearch} from './modules/general/search/consultant-skill-search_module.';
import {ExportDocumentList} from './modules/home/export/export-document-list_module';
import {getMuiTheme, spacing} from 'material-ui/styles';
import {lightBaseTheme} from 'material-ui/styles/baseThemes/lightBaseTheme';
import injectTapEventPlugin = require('react-tap-event-plugin');
import {
    cyan500, darkBlack, fullBlack, grey100, grey300, grey500, indigo500, indigo800, pinkA200, tealA400,
    white, indigo50, amber300, amber50, yellow50
} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';

injectTapEventPlugin();



let store = createStore(
    reducerApp,
    applyMiddleware(
        thunkMiddleware
    )
);

PowerLocalize.setLocale(navigator.language);
store.dispatch(ProfileAsyncActionCreator.requestQualifications());
store.dispatch(ProfileAsyncActionCreator.requestLanguages());
store.dispatch(ProfileAsyncActionCreator.requestEducations());
store.dispatch(ProfileAsyncActionCreator.requestTrainings());
store.dispatch(ProfileAsyncActionCreator.requestSectors());
store.dispatch(ProfileAsyncActionCreator.requestCompanies());
store.dispatch(ProfileAsyncActionCreator.requestProjectRoles());
store.dispatch(StatisticsActionCreator.AsyncCheckAvailability());

console.info('Current history location is ', browserHistory.getCurrentLocation());

const storedInitials = Cookies.get(COOKIE_INITIALS_NAME);
if(!isNullOrUndefined(storedInitials)) {
    console.info('Cookie detected. Performing auto Log-In.');
    // renew the cookie to hold another fixed period of time.
    Cookies.set(COOKIE_INITIALS_NAME, storedInitials, {expires: COOKIE_INITIALS_EXPIRATION_TIME});
    store.dispatch(ProfileAsyncActionCreator.logInUser(storedInitials));
} else {
    browserHistory.push('/');
}

export class Paths {
    public static readonly ADMIN_INBOX = '/admin/home/inbox';
    public static readonly ADMIN_TRASHBOX = '/admin/home/trashbox';
    public static readonly ADMIN_CONSULTANTS = '/admin/home/consultants';
    public static readonly ADMIN_LOGIN = '/login';
    public static readonly ADMIN_STATISTICS_SKILL = '/admin/home/statistics/skills';
    public static readonly ADMIN_STATISTICS_NETWORK = '/admin/home/statistics/network';
    public static readonly APP_ROOT = '/';
}


@DragDropContext(HTML5Backend)
class MyRouter extends React.Component<any, any> {
    render() {
        return (<Router history={browserHistory}>
            <Route path={Paths.APP_ROOT} component={PowerLogin}/>
            <Route path={Paths.ADMIN_LOGIN} component={AdminLogin}/>
            <Route path="/app" component={PowerClient}>
                <Route path="/app/home" component={PowerOverview}/>
                <Route path="/app/" component={ConsultantProfile}/>
                <Route path="/app/profile" component={ConsultantProfile}/>
                <Route path="/app/view" component={ViewProfileCard}/>
                <Route path="/app/reports" component={ExportDocumentList}/>
                <Route path="/app/statistics/network" component={ProfileNetworkGraph}/>
                <Route path="/app/statistics/clusterinfo" component={ClusterResult}/>
                <Route path="/app/statistics/skills" component={SkillStatistics}/>
                <Route path="/app/search" component={ConsultantSkillSearch}/>
            </Route>
            <Route path="/admin" component={AdminClient}>
                <Route path={Paths.ADMIN_INBOX} component={NotificationInbox} />
                <Route path={Paths.ADMIN_CONSULTANTS} component={ConsultantGrid} />
                <Route path={Paths.ADMIN_TRASHBOX} component={NotificationTrashbox} />
                <Route path={Paths.ADMIN_STATISTICS_SKILL} component={SkillStatistics} />
                <Route path={Paths.ADMIN_STATISTICS_NETWORK} component={ProfileNetwork} />
            </Route>
        </Router>);
    }
}

const powerTheme = {
    spacing: spacing,
    fontFamily: 'Roboto, sans-serif',
    palette: {
        primary1Color: indigo500,
        primary2Color: indigo800,
        primary3Color: indigo50,
        accent1Color: amber300,
        accent2Color: amber50,
        accent3Color: yellow50,
        textColor: darkBlack,
        alternateTextColor: white,
        canvasColor: white,
        borderColor: grey300,
        disabledColor: fade(darkBlack, 0.3),
        pickerHeaderColor: cyan500,
        clockCircleColor: fade(darkBlack, 0.07),
        shadowColor: fullBlack,
    },
};

const theme = getMuiTheme(powerTheme);


let App = (
    <MuiThemeProvider muiTheme={theme}>
        <Provider store={store}>
            <MyRouter/>
        </Provider>
    </MuiThemeProvider>
);


ReactDOM.render(
    App,
  document.getElementById('root')
);
