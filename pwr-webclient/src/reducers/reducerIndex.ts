import {applyMiddleware, combineReducers, createStore, Reducer, Store} from 'redux';
import {AdminReducer} from './admin/AdminReducer';
import {StatisticsReducer} from './statistics/StatisticsReducer';

import thunkMiddleware from 'redux-thunk';
import {SkillReducer} from './skill/SkillReducer';
import {MetaDataReducer} from './metadata/MetaDataReducer';
import {NavigationReducer} from './navigation/NavigationReducer';
import {ViewProfileReducer} from './view/ViewProfileReducer';
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
import {TemplateReducer} from './template/TemplateReducer';
import {reduceProfile} from './profile-new/profile/ProfileReducer';
import {reduceSuggestion} from './suggestions/SuggestionReducer';
import {SuggestionStore} from './suggestions/SuggestionStore';
import {composeWithDevTools} from 'redux-devtools-extension';
import {DeferredStore} from './deferred/DeferredStore';
import {reduceDeferredAction} from './deferred/DeferredActionReducer';
import {deferredActionMiddleware} from './deferred/DeferredActionMiddleware';
import {asyncActionUnWrapper} from './deferred/AsyncActionUnWrapper';
import {ReportStore} from './report/ReportStore';
import {reduceReports} from './report/ReportReducer';
import {SkillVersionStore} from './profile-skill/SkillVersionStore';
import {reduceSkillVersions} from './profile-skill/SkillVersionReducer';
import {TemplateStore} from './template/TemplateStore';


export interface ApplicationState {
    profileStore: ProfileStore;
    suggestionStore: SuggestionStore;
    adminReducer: AdminState;
    statisticsReducer: StatisticsStore;
    skillReducer: SkillStore;
    metaDataReducer: MetaDataStore;
    navigationSlice: NavigationStore;
    viewProfileSlice: ViewProfileStore;
    templateSlice: TemplateStore;
    crossCutting: CrossCuttingStore;
    router: Reducer<RouterState>;
    deferred: DeferredStore;
    reportStore:ReportStore;
}


const ApplicationStore: Reducer<ApplicationState> = combineReducers({
    profileStore: reduceProfile,
    suggestionStore: reduceSuggestion,
    adminReducer: AdminReducer.reduce,
    statisticsReducer: StatisticsReducer.reduce,
    skillReducer: SkillReducer.reduce,
    metaDataReducer: MetaDataReducer.reduce,
    navigationSlice: NavigationReducer.reduce,
    viewProfileSlice: ViewProfileReducer.reduce,
    crossCutting: CrossCuttingReducer.reduce,
    templateSlice: TemplateReducer.reduce,
    deferred: reduceDeferredAction,
    reportStore: reduceReports
});

export const PWR_HISTORY = createHistory();
const reactRouterMiddleware = routerMiddleware(PWR_HISTORY);

const composeEnhancers = composeWithDevTools({
    // Specify name here, actionsBlacklist, actionsCreators and other options if needed
});

export const store: Store<ApplicationState> = createStore(
    ApplicationStore,
    composeEnhancers(applyMiddleware(
        // The order is important. Deferred is supposed to be first, because it might defer async action (that are wrapped)
        // Async action un-wrapper MUST be before thunk, otherwise thunk won't realize its an async action
        (deferredActionMiddleware as any),
        (asyncActionUnWrapper as any),
        thunkMiddleware,
        reactRouterMiddleware,
    ))
);
