import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import reducerApp from './reducers/reducerIndex';
import {applyMiddleware, createStore} from 'redux';
import {Provider} from 'react-redux';

import thunkMiddleware from 'redux-thunk';
import {AsyncActions} from './reducers/consultants/consultant_actions';
import {Profile} from './modules/profile/profile_module';
import injectTapEventPlugin = require('react-tap-event-plugin');
import {PowerToolbar} from './modules/power-toolbar_module';
import {PowerClient} from './modules/power-client_module';
import {PowerLocalize} from './localization/PowerLocalizer';


injectTapEventPlugin();



let store = createStore(
    reducerApp,
    applyMiddleware(
        thunkMiddleware
    )
);

PowerLocalize.setLocale(navigator.language);


store.dispatch(AsyncActions.fetchConsultants());

ReactDOM.render(

    <MuiThemeProvider>

        <Provider store={store}>
            <PowerClient/>
        </Provider>
    </MuiThemeProvider>,
  document.getElementById('root')
);
