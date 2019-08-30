import * as React from 'react';
import {MuiPickersUtilsProvider} from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import {MuiThemeProvider} from '@material-ui/core';
import {POWER_MUI_THEME} from './PowerTheme';
import {Provider} from 'react-redux';
import {PWR_HISTORY, store} from './reducers/reducerIndex';
import {ConnectedRouter} from 'react-router-redux';
import {Route} from 'react-router';
import {Paths} from './Paths';
import {LoginModule} from './modules/login_module';
import {AdminLogin} from './modules/admin/admin-login_module';
import {PowerClient} from './modules/home/power-client_module';
import {AdminClient} from './modules/admin/admin-client_module';
import {ConfirmNavDialog} from './modules/navigation/confirm-nav-dialog_module';
import {PwrConfirmDeferredActionDialog} from './modules/general/pwr-confirm-deferred-action-dialog';
import {PowerLocalize} from './localization/PowerLocalizer';

export class AppWrapper extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
        PowerLocalize.setLocale(navigator.language)
            .then(value => this.forceUpdate());
    }

    render() {
        return (
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
                            </div>
                        </ConnectedRouter>
                    </Provider>
                </MuiThemeProvider>
            </MuiPickersUtilsProvider>
        );
    }
}
