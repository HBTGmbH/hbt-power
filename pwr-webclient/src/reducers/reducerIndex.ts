import {combineReducers} from 'redux';
import {databaseReducer} from './profile/database-reducer';
import {AdminReducer} from './admin/AdminReducer';

const ApplicationStore = combineReducers({
    databaseReducer: databaseReducer,
    adminReducer: AdminReducer.reduce
});

export default ApplicationStore;