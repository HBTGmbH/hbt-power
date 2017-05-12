import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import reducerApp from './reducers/reducerIndex';
import {applyMiddleware, createStore} from 'redux';
import {Provider} from 'react-redux';

import thunkMiddleware from 'redux-thunk';
import {PowerClient} from './modules/power-client_module';
import {PowerLocalize} from './localization/PowerLocalizer';
import {ProfileAsyncActionCreator} from './reducers/singleProfile/ProfileAsyncActionCreator';
import injectTapEventPlugin = require('react-tap-event-plugin');
import {PowerLogin} from './modules/power-login_module';
import {Route, Router} from 'react-router';
import { browserHistory } from 'react-router'

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
store.dispatch(ProfileAsyncActionCreator.requestCareers());
store.dispatch(ProfileAsyncActionCreator.requestSectors());
store.dispatch(ProfileAsyncActionCreator.requestCompanies());
store.dispatch(ProfileAsyncActionCreator.requestProjectRoles());
//store.dispatch(ProfileAsyncActionCreator.requestSingleProfile('jd'));

let Routes = (
    <MuiThemeProvider>
        <Provider store={store}>
            <Router history={browserHistory}>
                <Route path="/" component={PowerLogin}/>
                <Route path="/home" component={PowerClient}/>
            </Router>
        </Provider>
    </MuiThemeProvider>
);


ReactDOM.render(
    Routes,
  document.getElementById('root')
);
