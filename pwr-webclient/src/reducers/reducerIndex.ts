import {applyMiddleware, combineReducers, createStore, Reducer} from 'redux';
import {AdminReducer} from './admin/AdminReducer';
import {DatabaseReducer} from './profile/DatabaseReducer';
import {StatisticsReducer} from './statistics/StatisticsReducer';

import thunkMiddleware from 'redux-thunk';
import {SkillReducer} from './skill/SkillReducer';
import {MetaDataReducer} from './metadata/MetaDataReducer';
import {NavigationReducer} from './navigation/NavigationReducer';
import {ViewProfileReducer} from './view/ViewProfileReducer';
import {ProfileStore} from '../model/ProfileStore';
import {AdminState} from '../model/admin/AdminState';
import {StatisticsStore} from '../model/statistics/StatisticsStore';
import {SkillStore} from '../model/skill/SkillStore';
import {MetaDataStore} from '../model/metadata/MetaDataStore';
import {NavigationStore} from '../model/navigation/NavigationStore';
import {ViewProfileStore} from '../model/view/ViewProfileStore';
import {routerMiddleware, RouterState} from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';


export interface ApplicationState {
    databaseReducer: ProfileStore;
    adminReducer: AdminState;
    statisticsReducer: StatisticsStore;
    skillReducer: SkillStore;
    metaDataReducer: MetaDataStore;
    navigationSlice: NavigationStore;
    viewProfileSlice: ViewProfileStore;
    router: Reducer<RouterState>;
}


const ApplicationStore = combineReducers({
    databaseReducer: DatabaseReducer.Reduce,
    adminReducer: AdminReducer.reduce,
    statisticsReducer: StatisticsReducer.reduce,
    skillReducer: SkillReducer.reduce,
    metaDataReducer: MetaDataReducer.reduce,
    navigationSlice: NavigationReducer.reduce,
    viewProfileSlice: ViewProfileReducer.reduce,
});

export const PWR_HISTORY = createHistory();
const reactRouterMiddleware = routerMiddleware(PWR_HISTORY);

export const store = createStore(
    ApplicationStore,
    applyMiddleware(
        thunkMiddleware,
        reactRouterMiddleware
    )
);


export default ApplicationStore;