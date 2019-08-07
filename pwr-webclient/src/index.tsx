import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import './../node_modules/react-toggle/style.css';
import {ApplicationState, PWR_HISTORY, store} from './reducers/reducerIndex';
import {Provider} from 'react-redux';
import {PowerClient} from './modules/home/power-client_module';
import {PowerLocalize} from './localization/PowerLocalizer';
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
import {ThemeOptions} from '@material-ui/core/styles/createMuiTheme';
import {MuiPickersUtilsProvider} from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import {LoginModule} from './modules/login_module';
import {PwrConfirmDeferredActionDialog} from './modules/general/pwr-confirm-deferred-action-dialog';
import {storeHasUnsavedChanges} from './utils/PwrStoreUtils';

const AlertContainer = require('react-alert').default;

const paths = new Paths();
paths.restorePath();

PowerLocalize.setLocale(navigator.language);
store.dispatch(StatisticsActionCreator.AsyncCheckAvailability());


// Prevents navigation
const pageLeavePreventer = (ev: any) => {
    let state: ApplicationState = store.getState() as ApplicationState;
    return storeHasUnsavedChanges(store.getState()) ? 'DoNotLeave' : null;
};

/**
 * Register a listener that is called before the page is closed.
 */
window.onbeforeunload = pageLeavePreventer;


const newPowerTheme:ThemeOptions = {
    typography: {
        useNextVariants: true,
        fontSize: 24,
        fontFamily: [
            'Roboto',
            'sans-serif',].join(','),
    },
    palette: {
        primary: {
            light: '#474b77',
            main: '#191E55',
            dark: '#11153b',
            contrastText:'#fff',
        },
        secondary: {
            light: '#6bebeb',
            main: '#46E6E6',
            dark: '#31a1a1',
        },
        error: {
            main: Color.HBT_2017_HIGHLIGHT.toCSSRGBString(),
        },
        text: {

            //disabled: Color.HBT_2017_GRAY.toCSSRGBAString(0.5),
        }
    },
    props: {
        MuiPaper: {
            square: true
        }
    },
    overrides: {
        MuiDialogContent: {
            root: {
                overflowY: 'unset',
            }
        },
        MuiDialog: {
            paper: {
                overflowY: 'unset',
            }
        },
        MuiInputAdornment: {
            root: {
                height: 'auto'
            }
        },
        MuiTabs: {
            root: {
                color: '#fff',
                indicatorColor: '#46E6E6',
                backgroundColor: "#191E55"
            }
        },
        MuiTab: {
            selected: {
                color: '#46E6E6'
            }
        }
    }
};

export const POWER_MUI_THEME = createMuiTheme(newPowerTheme as any);

const alertOptions = {
    offset: 14,
    position: 'bottom left',
    theme: 'dark',
    time: 0,
    transition: 'scale'
};


let App = (
    <MuiPickersUtilsProvider utils={MomentUtils}>
        <MuiThemeProvider theme={POWER_MUI_THEME}>
            <Provider store={store}>
                <ConnectedRouter history={PWR_HISTORY}>
                    <div>

                        <Route exact path={Paths.APP_ROOT} component={LoginModule}/>
                        <Route exact path={Paths.ADMIN_LOGIN} component={AdminLogin}/>
                        <Route path={Paths.USER_BASE} component={PowerClient}/>
                        <Route path={Paths.ADMIN_BASE} component={AdminClient}/>
                        <ConfirmNavDialog/>
                        <PwrConfirmDeferredActionDialog/>
                        <AlertContainer
                            ref={(a: any) => NavigationActionCreator.setAlertContainer(a)}{...alertOptions}/>
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
