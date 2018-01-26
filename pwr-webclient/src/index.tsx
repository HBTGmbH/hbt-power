import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import './../node_modules/react-toggle/style.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {ApplicationState, PWR_HISTORY, store} from './reducers/reducerIndex';
import {Provider} from 'react-redux';
import {PowerClient} from './modules/home/power-client_module';
import {PowerLocalize} from './localization/PowerLocalizer';
import {ProfileAsyncActionCreator} from './reducers/profile/ProfileAsyncActionCreator';
import {PowerLogin} from './modules/power-login_module';
import {AdminClient} from './modules/admin/admin-client_module';
import {AdminLogin} from './modules/admin/admin-login_module';
import {StatisticsActionCreator} from './reducers/statistics/StatisticsActionCreator';
import {getMuiTheme, spacing} from 'material-ui/styles';
import {darkBlack, fullBlack, fullWhite, white} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
import {Paths} from './Paths';
import {ConfirmNavDialog} from './modules/navigation/confirm-nav-dialog_module';
import {Color} from './utils/ColorUtil';
import {Route} from 'react-router-dom';
import {ConnectedRouter} from 'react-router-redux';

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
    spacing: spacing,
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
        canvasColor: white,
        borderColor: fade(fullWhite, 0.3),
        disabledColor: fade(Color.HBT_2017_DARK_BLUE.toCSSRGBString(), 0.3),
        pickerHeaderColor: Color.HBT_2017_SPOT_COLOR_1.toCSSRGBString(),
        clockCircleColor: fade(darkBlack, 0.07),
        shadowColor: fullBlack,
    },
};

export const POWER_MUI_THEME = getMuiTheme(powerTheme);


let App = (
    <MuiThemeProvider muiTheme={POWER_MUI_THEME}>
        <Provider store={store}>
            <ConnectedRouter history={PWR_HISTORY}>
                <div>
                    <Route exact path={Paths.APP_ROOT} component={PowerLogin}/>
                    <Route exact path={Paths.ADMIN_LOGIN} component={AdminLogin}/>
                    <Route path={Paths.USER_BASE} component={PowerClient}/>
                    <Route path={Paths.ADMIN_BASE} component={AdminClient}/>
                    <ConfirmNavDialog/>
                </div>
            </ConnectedRouter>
        </Provider>
    </MuiThemeProvider>
);


ReactDOM.render(
    App,
  document.getElementById('root')
);
