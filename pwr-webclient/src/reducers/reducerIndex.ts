import {combineReducers} from 'redux';
import {AdminReducer} from './admin/AdminReducer';
import {DatabaseReducer} from './profile/DatabaseReducer';
import {StatisticsReducer} from './statistics/StatisticsReducer';

const ApplicationStore = combineReducers({
    databaseReducer: DatabaseReducer.Reduce,
    adminReducer: AdminReducer.reduce,
    statisticsReducer: StatisticsReducer.reduce
});

export default ApplicationStore;