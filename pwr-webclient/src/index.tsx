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
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core';
//import {darkBlack, fullBlack, fullWhite, white,} from '@material-ui/core/colors';
//import {fade} from '@material-ui/utils/colorManipulator';
import {Paths} from './Paths';
import {ConfirmNavDialog} from './modules/navigation/confirm-nav-dialog_module';
import {Color} from './utils/ColorUtil';
import {Route} from 'react-router-dom';
import {ConnectedRouter} from 'react-router-redux';
import {NavigationActionCreator} from './reducers/navigation/NavigationActionCreator';

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
const pageLeavePreventer = (ev: any) => {
    let state: ApplicationState = store.getState() as ApplicationState;
    let changes = state.databaseReducer.profile().changesMade();
    console.log("Changes", changes);
    return changes > 0 ? "DoNotLeave" : null;
};

/**
 * Register a listener that is called before the page is closed.
 */
window.onbeforeunload = pageLeavePreventer;



const powerTheme = {
    //spacing: spacing,
    fontFamily: 'Roboto, sans-serif',
    palette: {
        primary1Color: Color.HBT_2017_DARK_BLUE.toCSSRGBString(),
        primary2Color: Color.HBT_2017_MEDIUM_BLUE.toCSSRGBString(),
        primary3Color: Color.HBT_2017_LIGHT_BLUE.toCSSRGBString(),
        accent1Color: Color.HBT_2017_HIGHLIGHT.toCSSRGBString(),
        accent2Color: Color.HBT_2017_SPOT_COLOR_2.toCSSRGBString(),
        accent3Color: Color.HBT_2017_GRAY.toCSSRGBString(),
        textColor: Color.HBT_2017_TEXT_BLACK.toCSSRGBString(),
        alternateTextColor:  Color.HBT_2017_TEXT_WHITE.toCSSRGBString(),
        //canvasColor: white,
        //borderColor: fade(fullWhite, 0.3),
        //disabledColor: fade(Color.HBT_2017_DARK_BLUE.toCSSRGBString(), 0.3),
        pickerHeaderColor: Color.HBT_2017_SPOT_COLOR_1.toCSSRGBString(),
        //clockCircleColor: fade(darkBlack, 0.07),
        //shadowColor: fullBlack,
    },
};

const newPowerTheme = {
    typography:{
        fontSize:24,
        fontFamily:[
            "Roboto",
            "sans-serif",].join(','),
    },
    palette: {
        primary: {
            light: Color.HBT_2017_LIGHT_BLUE.toCSSRGBString(),
            main : Color.HBT_2017_DARK_BLUE.toCSSRGBString(),
            dark : Color.HBT_2017_DARK_BLUE.toCSSRGBString(),

        },
        secondary :{
            light: Color.HBT_2017_LIGHT_BLUE.toCSSRGBString(),
            main : "#FFFFFF",//Color.HBT_2017_GRAY.toCSSRGBString(),
            dark : Color.HBT_2017_DARK_BLUE.toCSSRGBString(),
        },
        error:{
            main: Color.HBT_2017_HIGHLIGHT.toCSSRGBString(),
        },
    },

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
);


ReactDOM.render(
    App,
  document.getElementById('root')
);
