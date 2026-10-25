import * as React from 'react';
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
// German month and day names in the date pickers (#143)
import 'moment/locale/de';
import {MuiThemeProvider} from '@material-ui/core';
import {POWER_MUI_THEME} from './PowerTheme';
import {Provider} from 'react-redux';
import {store} from './reducers/reducerIndex';
import {Redirect, Route, Router} from 'react-router-dom';
import {Paths} from './Paths';
import {LoginModule} from './modules/login_module';
import {PowerClient} from './modules/home/power-client_module';
import {AdminClient} from './modules/admin/admin-client_module';
import {UnsavedChangesDialog} from './modules/navigation/unsaved-changes-dialog';
import {SessionExpiredDialog} from './modules/navigation/session-expired-dialog';
import {PwrConfirmDeferredActionDialog} from './modules/general/pwr-confirm-deferred-action-dialog';
import {PowerLocalize} from './localization/PowerLocalizer';
import {PWR_HISTORY} from './reducers/navigation/NavigationActionCreator';
import {OIDCService} from './OIDCService';
import {AuthenticatedRoute} from './modules/navigation/authenticated-route_module';
import {ConsultantNamesLoader} from './modules/general/pwr-consultant-name';
import {StartPage} from './modules/start-page_module';
import {PwrThemeColors} from './modules/general/pwr-theme-colors';
import {PwrNewVersionNotice} from './modules/general/pwr-new-version-notice';

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
            <MuiPickersUtilsProvider utils={MomentUtils} locale="de">
                <MuiThemeProvider theme={POWER_MUI_THEME}>
                    <PwrThemeColors/>
                    <Router history={PWR_HISTORY}>
                        <Provider store={store}>
                            <div>
                                <Route exact path={Paths.APP_ROOT} component={LoginModule}/>
                                <AuthenticatedRoute path={Paths.START} component={StartPage}/>
                                <Route path={Paths.FORMER_PROFILE_SELECT}><Redirect to={Paths.START}/></Route>
                                <AuthenticatedRoute path={Paths.USER_BASE} component={PowerClient}/>
                                <AuthenticatedRoute requiresAdmin path={Paths.ADMIN_BASE} component={AdminClient}/>
                                <ConsultantNamesLoader/>
                                <UnsavedChangesDialog/>
                                <SessionExpiredDialog/>
                                <PwrConfirmDeferredActionDialog/>
                                <PwrNewVersionNotice/>
                            </div>
                        </Provider>
                    </Router>
                </MuiThemeProvider>
            </MuiPickersUtilsProvider>
        );
    }
}
