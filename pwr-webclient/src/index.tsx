import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import reducerApp from './reducers/reducerIndex';
import {applyMiddleware, createStore} from 'redux';
import {Provider} from 'react-redux';

import thunkMiddleware from 'redux-thunk';
import {AsyncActions} from './reducers/consultants/consultant_actions';
import {PowerClient} from './modules/power-client_module';
import {PowerLocalize} from './localization/PowerLocalizer';
import {ProfileAsyncActionCreator} from './reducers/singleProfile/singleProfileActions';
import injectTapEventPlugin = require('react-tap-event-plugin');


injectTapEventPlugin();



let store = createStore(
    reducerApp,
    applyMiddleware(
        thunkMiddleware
    )
);

PowerLocalize.setLocale(navigator.language);

store.dispatch(ProfileAsyncActionCreator.requestSingleProfile("nt"));
//store.dispatch(AsyncActions.fetchConsultants());

ReactDOM.render(

    <MuiThemeProvider>

        <Provider store={store}>
            <PowerClient/>
        </Provider>
    </MuiThemeProvider>,
  document.getElementById('root')
);
