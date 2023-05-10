import * as React from 'react';
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import {MuiThemeProvider} from '@material-ui/core';
import {POWER_MUI_THEME} from './PowerTheme';
import {Provider} from 'react-redux';
import {store} from './reducers/reducerIndex';
import {Route, Router} from 'react-router-dom';
import {Paths} from './Paths';
import {LoginModule} from './modules/login_module';
import {PowerClient} from './modules/home/power-client_module';
import {AdminClient} from './modules/admin/admin-client_module';
import {ConfirmNavDialog} from './modules/navigation/confirm-nav-dialog_module';
import {PwrConfirmDeferredActionDialog} from './modules/general/pwr-confirm-deferred-action-dialog';
import {PowerLocalize} from './localization/PowerLocalizer';
import {PWR_HISTORY} from './reducers/navigation/NavigationActionCreator';
import {OIDCService} from './OIDCService';
import {AuthenticatedRoute} from './modules/navigation/authenticated-route_module';
import {ProfileSelect} from './modules/profile-select_module';

export class AppWrapper extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
        PowerLocalize.setLocale();
    }

    componentDidMount() {
        OIDCService.instance().renewLogin();
    }

    render() {
        return (
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <MuiThemeProvider theme={POWER_MUI_THEME}>
                    <Provider store={store}>
                        <Router history={PWR_HISTORY}>
                            <div>
                                <Route exact path={Paths.APP_ROOT} component={LoginModule}/>
                                <AuthenticatedRoute path={Paths.PROFILE_SELECT} component={ProfileSelect}/>
                                <AuthenticatedRoute path={Paths.USER_BASE} component={PowerClient}/>
                                <AuthenticatedRoute requiresAdmin path={Paths.ADMIN_BASE} component={AdminClient}/>
                                <ConfirmNavDialog/>
                                <PwrConfirmDeferredActionDialog/>
                            </div>
                        </Router>
                    </Provider>
                </MuiThemeProvider>
            </MuiPickersUtilsProvider>
        );
    }
}
