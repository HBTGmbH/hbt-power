import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import {ConsultantLocalProps} from './consultant_module';
import {List, ListItem, Drawer} from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin = require('react-tap-event-plugin');
import {ConsultantDashboard} from './consultant-dashboard_module';
import reducerApp from './reducers/reducerIndex';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';

import thunkMiddleware from 'redux-thunk'
import {AsyncActions} from './actions';

injectTapEventPlugin();



let store = createStore(
    reducerApp,
    applyMiddleware(
        thunkMiddleware
    )
);

store.dispatch(AsyncActions.fetchConsultants());

ReactDOM.render(
    <MuiThemeProvider>
        <Provider store={store}>
            <ConsultantDashboard/>
        </Provider>
    </MuiThemeProvider>,
  document.getElementById('root')
);
