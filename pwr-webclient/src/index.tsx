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
import {ProfileAsyncActionCreator} from './reducers/singleProfile/singleProfileActions';
import injectTapEventPlugin = require('react-tap-event-plugin');
import {Project} from './model/Project';
import {ProjectCard} from './modules/profile/elements/project/project-module';


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
store.dispatch(ProfileAsyncActionCreator.requestSingleProfile("jd"));



//store.dispatch(AsyncActions.fetchConsultants());

ReactDOM.render(

    <MuiThemeProvider>

        <Provider store={store}>
          <PowerClient/>
        </Provider>
    </MuiThemeProvider>,
  document.getElementById('root')
);
