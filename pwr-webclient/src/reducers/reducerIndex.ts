import {combineReducers} from 'redux';
import {AdminReducer} from './admin/AdminReducer';
import {DatabaseReducer} from './profile/DatabaseReducer';

const ApplicationStore = combineReducers({
    databaseReducer: DatabaseReducer.Reduce,
    adminReducer: AdminReducer.reduce
});

export default ApplicationStore;