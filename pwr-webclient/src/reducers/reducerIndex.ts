import {applyMiddleware, combineReducers, createStore} from 'redux';
import {AdminReducer} from './admin/AdminReducer';
import {DatabaseReducer} from './profile/DatabaseReducer';
import {StatisticsReducer} from './statistics/StatisticsReducer';

import thunkMiddleware from 'redux-thunk';
import {SkillReducer} from './skill/SkillReducer';

const ApplicationStore = combineReducers({
    databaseReducer: DatabaseReducer.Reduce,
    adminReducer: AdminReducer.reduce,
    statisticsReducer: StatisticsReducer.reduce,
    skillReducer: SkillReducer.reduce
});

export const store = createStore(
    ApplicationStore,
    applyMiddleware(
        thunkMiddleware
    )
);


export default ApplicationStore;