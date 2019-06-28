import {applyMiddleware, combineReducers, createStore, Reducer, Store} from 'redux';
import {AdminReducer} from './admin/AdminReducer';
import {DatabaseReducer} from './profile/DatabaseReducer';
import {StatisticsReducer} from './statistics/StatisticsReducer';

import thunkMiddleware from 'redux-thunk';
import {SkillReducer} from './skill/SkillReducer';
import {MetaDataReducer} from './metadata/MetaDataReducer';
import {NavigationReducer} from './navigation/NavigationReducer';
import {ViewProfileReducer} from './view/ViewProfileReducer';
import * as ProfileStoreOld from '../model/ProfileStore';
import {ProfileStore} from './profile-new/ProfileStore';
import {AdminState} from '../model/admin/AdminState';
import {StatisticsStore} from '../model/statistics/StatisticsStore';
import {SkillStore} from '../model/skill/SkillStore';
import {MetaDataStore} from '../model/metadata/MetaDataStore';
import {NavigationStore} from '../model/navigation/NavigationStore';
import {ViewProfileStore} from '../model/view/ViewProfileStore';
import {routerMiddleware, RouterState} from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import {CrossCuttingReducer} from './crosscutting/CrossCuttingReducer';
import {CrossCuttingStore} from '../model/crosscutting/CrossCuttingStore';
import {TemplateStore} from '../model/view/TemplateStore';
import {TemplateReducer} from './template/TemplateReducer';
import {reduce} from './profile-new/ProfileReducer';


export interface ApplicationState {
    profile: ProfileStore;
    databaseReducer: ProfileStoreOld.ProfileStore;
    adminReducer: AdminState;
    statisticsReducer: StatisticsStore;
    skillReducer: SkillStore;
    metaDataReducer: MetaDataStore;
    navigationSlice: NavigationStore;
    viewProfileSlice: ViewProfileStore;
    templateSlice: TemplateStore;
    crossCutting: CrossCuttingStore;
    router: Reducer<RouterState>;
}


const ApplicationStore: Reducer<ApplicationState> = combineReducers({
    profile: reduce,
    databaseReducer: DatabaseReducer.Reduce,
    adminReducer: AdminReducer.reduce,
    statisticsReducer: StatisticsReducer.reduce,
    skillReducer: SkillReducer.reduce,
    metaDataReducer: MetaDataReducer.reduce,
    navigationSlice: NavigationReducer.reduce,
    viewProfileSlice: ViewProfileReducer.reduce,
    crossCutting: CrossCuttingReducer.reduce,
    templateSlice: TemplateReducer.reduce,
});

export const PWR_HISTORY = createHistory();
const reactRouterMiddleware = routerMiddleware(PWR_HISTORY);

export const store: Store<ApplicationState> = createStore(
    ApplicationStore,
    applyMiddleware(
        thunkMiddleware,
        reactRouterMiddleware
    )
);