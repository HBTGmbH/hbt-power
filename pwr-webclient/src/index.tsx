import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import './../node_modules/react-toggle/style.css';
import {ApplicationState, PWR_HISTORY, store} from './reducers/reducerIndex';
import {Provider} from 'react-redux';
import {PowerClient} from './modules/home/power-client_module';
import {PowerLocalize} from './localization/PowerLocalizer';
import {ProfileAsyncActionCreator} from './reducers/profile/ProfileAsyncActionCreator';
import {PowerLogin} from './modules/power-login_module';
import {AdminClient} from './modules/admin/admin-client_module';
import {AdminLogin} from './modules/admin/admin-login_module';
import {StatisticsActionCreator} from './reducers/statistics/StatisticsActionCreator';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';
import {Paths} from './Paths';
import {ConfirmNavDialog} from './modules/navigation/confirm-nav-dialog_module';
import {Color} from './utils/ColorUtil';
import {Route} from 'react-router-dom';
import {ConnectedRouter} from 'react-router-redux';
import {NavigationActionCreator} from './reducers/navigation/NavigationActionCreator';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils';

const AlertContainer = require('react-alert').default;

const paths = new Paths();
paths.restorePath();

PowerLocalize.setLocale(navigator.language);
store.dispatch(ProfileAsyncActionCreator.requestQualifications());
store.dispatch(ProfileAsyncActionCreator.requestLanguages());
store.dispatch(ProfileAsyncActionCreator.requestEducations());
store.dispatch(ProfileAsyncActionCreator.requestTrainings());
store.dispatch(ProfileAsyncActionCreator.requestSectors());
store.dispatch(ProfileAsyncActionCreator.requestCompanies());
store.dispatch(ProfileAsyncActionCreator.requestProjectRoles());
// TODO hier templates laden ??!
store.dispatch(StatisticsActionCreator.AsyncCheckAvailability());



// Prevents navigation
// TODO nt hat ne middleware dafür gemacht.
const pageLeavePreventer = (ev: any) => {
    let state: ApplicationState = store.getState() as ApplicationState;
    let changes = state.databaseReducer.profile().changesMade();
    console.log('Changes', changes);
    return changes > 0 ? 'DoNotLeave' : null;
};

/**
 * Register a listener that is called before the page is closed.
 */
window.onbeforeunload = pageLeavePreventer;


const newPowerTheme = {
    typography:{
        fontSize:24,
        fontFamily:[
            'Roboto',
            'sans-serif',].join(','),
    },
    palette: {
        primary: {
            light: Color.HBT_2017_LIGHT_BLUE.toCSSRGBString(),
            main: Color.HBT_2017_DARK_BLUE.toCSSRGBString(),
            dark: Color.HBT_2017_DARK_BLUE.toCSSRGBString(),
            contrastText: Color.HBT_2017_WHITE.toCSSRGBString(),
        },
        secondary: {
            main: Color.HBT_2017_WHITE.toCSSRGBString(),
        },
        error: {
            main: Color.HBT_2017_HIGHLIGHT.toCSSRGBString(),
        },
        text: {
            secondary: Color.HBT_2017_GRAY.toCSSRGBString(),
            disabled: Color.HBT_2017_GRAY.toCSSRGBAString(0.3),
        }
    },
    props: {
        MuiPaper: {
            square: true
        }
    }
};

export const POWER_MUI_THEME = createMuiTheme(newPowerTheme);

const alertOptions = {
    offset: 14,
    position: 'bottom left',
    theme: 'dark',
    time: 0,
    transition: 'scale'
};


let App = (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <MuiThemeProvider theme={POWER_MUI_THEME}>
            <Provider store={store}>
                <ConnectedRouter history={PWR_HISTORY}>
                    <div>
                        <Route exact path={Paths.APP_ROOT} component={PowerLogin}/>
                        <Route exact path={Paths.ADMIN_LOGIN} component={AdminLogin}/>
                        <Route path={Paths.USER_BASE} component={PowerClient}/>
                        <Route path={Paths.ADMIN_BASE} component={AdminClient}/>
                        <ConfirmNavDialog/>
                        <AlertContainer  ref={(a:any) => NavigationActionCreator.setAlertContainer(a)}{...alertOptions}/>
                    </div>
                </ConnectedRouter>
            </Provider>
        </MuiThemeProvider>
    </MuiPickersUtilsProvider>
);


ReactDOM.render(
    App,
  document.getElementById('root')
);
